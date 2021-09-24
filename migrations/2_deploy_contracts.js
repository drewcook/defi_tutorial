const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

// deployer is our deployer that deploys contracts onto the network
// network is our blockchain network
// accounts maps to our Ganache wallets
module.exports = async function (deployer, network, accounts) {
	/*
	 * 1. Deploy all smart contracts onto the network
	 */

	// Deploy mock DAI token
	await deployer.deploy(DaiToken)
	const daiToken = await DaiToken.deployed()
	// Deploy Dapp token
	await deployer.deploy(DappToken)
	const dappToken = await DappToken.deployed()
	// Deploy token farm
	await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
	const tokenFarm = await TokenFarm.deployed()

	/*
	 * 2. Add all Dapp tokens into a liquidity pool (token farm) so that investors
	 * can earn them through yield farming, through interest
	 */
	await dappToken.transfer(tokenFarm.address, '1000000000000000000000000') // 1 million DAPP

	/*
	 * 3. Transfer some DAI token to an investor so they may stake it
	 */
	await daiToken.transfer(accounts[1], '100000000000000000000') // 100 mock DAI
}
