pragma solidity >=0.5.0;

import './DappToken.sol';
import './DaiToken.sol';

contract TokenFarm {
	address public owner;
	string public name = 'Dapp Token Farm';
	DappToken public dappToken;
	DaiToken public daiToken;
	address[] public stakers;

	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	// Called when contract is deployed to network
	constructor(DappToken _dappToken, DaiToken _daiToken) public {
		// store refs for other tokens, use their token address on the network
		// we assume both DappToken and DaiToken have been deployed to the network already
		dappToken = _dappToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}

	// Stake tokens - (Deposit)
	function stakeTokens(uint _amount) public {
		// require and amount to be staked
		require(_amount > 0, 'amount cannot be 0');

		// transfer DAI tokens from investor's wallet to this smart contract
		daiToken.transferFrom(msg.sender, address(this), _amount);
		// update staking balance
		stakingBalance[msg.sender] += _amount;
		// add sender to stakers array (only if they havent staked already)
		// used for tracking and issuing rewards later
		if (!hasStaked[msg.sender]) stakers.push(msg.sender);
		// tell the app that the user has staked tokens, update status
		hasStaked[msg.sender] = true;
		isStaking[msg.sender] = true;
	}

	// Issuing tokens - typically an owner of the contract can decide when to issue out tokens
	// Maybe it's on a set schedule, like once a week/month/etc.
	function issueTokens() public {
		// require that the owner of this contract is the only user that can issue tokens
		require(msg.sender == owner, 'caller must be token farm owner');

		// issue out our Dapp Tokens as interest to investors that have staked to our farm
		for (uint i = 0; i < stakers.length; i++) {
			address recipient = stakers[i];
			uint balance = stakingBalance[recipient];
			// issue out 1 Dapp Token per mDAI staked - 1:1
			if (balance > 0) dappToken.transfer(recipient, balance);
		}
	}

	// Unstake tokens - (Withdraw)
	function unstakeTokens(uint _amount) public {
		// ensure the staker's balance is greater than 0
		uint balance = stakingBalance[msg.sender];
		require(balance > 0, 'balance must be greater than 0');
		require(_amount <= balance, 'overdraw issue');

		// withdraw an investor's DAI from farm and add to their address
		daiToken.transfer(msg.sender, _amount);
		// update staking balance and status for user (if withdrawing all)
		stakingBalance[msg.sender] -= _amount;
		if (_amount == balance) isStaking[msg.sender] = false;
	}

	// Unstake all tokens from farm
	function unstakeAllTokens() public {
		uint balance = stakingBalance[msg.sender];
		require(balance > 0, 'staking balance cannot be 0');
		daiToken.transfer(msg.sender, balance);
		stakingBalance[msg.sender] = 0;
		isStaking[msg.sender] = false;
	}
}
