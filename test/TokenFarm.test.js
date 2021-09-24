const { assert } = require('chai')

const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai').use(require('chai-as-promised')).should()

function tokens(n) {
	return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
	let daiToken, dappToken, tokenFarm

	before(async () => {
		// Load contracts
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

		// Transfer all Dapp tokens to farm (1 million)
		await dappToken.transfer(tokenFarm.address, tokens('1000000'))

		// Send tokens to investor
		await daiToken.transfer(investor, tokens('100'), { from: owner })
	})

	describe('Mock DAI deployment', async () => {
		it('has a name', async () => {
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})

	describe('Dapp Token deployment', async () => {
		it('has a name', async () => {
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})

	describe('Token Farm deployment', async () => {
		it('has a name', async () => {
			const name = await tokenFarm.name()
			assert.equal(name, 'Dapp Token Farm')
		})

		it('contract has tokens', async () => {
			let balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe('Farming tokens', async () => {
		it('rewards investors for staking mDai tokens', async () => {
			let result

			/*
				Staking Tokens
			*/
			// Check investor balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(
				result.toString(),
				tokens('100'),
				'investor Mock DAI wallet balance correct before staking',
			)
			// Stake the tokens
			await daiToken.approve(tokenFarm.address, tokens('10'), { from: investor })
			await tokenFarm.stakeTokens(tokens('10'), { from: investor })
			// Check investor balance after staking
			result = await daiToken.balanceOf(investor)
			assert.equal(
				result.toString(),
				tokens('90'),
				'investor Mock DAI wallet balance correct after staking',
			)
			// Check farm balance after investor's staking
			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(
				result.toString(),
				tokens('10'),
				'token farm Mock DAI balance correct after staking',
			)
			// Check that investor's staking balance and staking status are both correct
			result = await tokenFarm.stakingBalance(investor)
			assert.equal(
				result.toString(),
				tokens('10'),
				'investor staking balance correct after staking',
			)
			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investor staking status is true')

			/*
				Issuing Tokens
			*/
			await tokenFarm.issueTokens({ from: owner })
			// Check balances after issuance
			result = await dappToken.balanceOf(investor)
			assert.equal(
				result.toString(),
				tokens('10'),
				'investor DApp Token wallet balance correct after issuance',
			)
			// Ensure the owner is the only one that can issue tokens
			await tokenFarm.issueTokens({ from: investor }).should.be.rejected

			/*
				Unstaking Tokens
			*/
			// Unstake 2 tokens
			await tokenFarm.unstakeTokens(tokens('2'), { from: investor })
			// Check balances after unstaking 2
			result = await daiToken.balanceOf(investor)
			assert.equal(
				result.toString(),
				tokens('92'),
				'investor Mock DAI wallet balance correct after unstaking portion',
			)
			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(
				result.toString(),
				tokens('8'),
				'invester staking balance correct after unstaking portion',
			)
			result = await tokenFarm.stakingBalance(investor)
			assert.equal(
				result.toString(),
				tokens('8'),
				'token farm Mock DAI balance correct after unstaking portion',
			)
			result = await tokenFarm.isStaking(investor)
			assert.equal(
				result.toString(),
				'true',
				'investor staking status correct after unstaking portion',
			)
			// Unstake all of investor's tokens in farm
			await tokenFarm.unstakeAllTokens({ from: investor })
			result = await daiToken.balanceOf(investor)
			assert.equal(
				result.toString(),
				tokens('100'),
				'investor Mock DAI wallet balance correct after unstaking all',
			)
			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(
				result.toString(),
				tokens('0'),
				'invester staking balance correct after unstaking all',
			)
			result = await tokenFarm.stakingBalance(investor)
			assert.equal(
				result.toString(),
				tokens('0'),
				'token farm Mock DAI balance correct after unstaking all',
			)
			result = await tokenFarm.isStaking(investor)
			assert.equal(
				result.toString(),
				'false',
				'investor staking status correct after unstaking all',
			)
		})
	})
})
