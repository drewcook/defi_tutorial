import PropTypes from 'prop-types'
import React, { useState } from 'react'
import dai from '../dai.png'

const Main = ({
	daiTokenBalance,
	dappTokenBalance,
	stakingBalance,
	stakeTokens,
	unstakeAllTokens,
}) => {
	const [stakeValue, setStakeValue] = useState('0')

	const handleSubmit = e => {
		e.preventDefault()
		const amount = window.web3.utils.toWei(stakeValue, 'ether')
		stakeTokens(amount)
	}

	const handleWithdraw = e => {
		e.preventDefault()
		unstakeAllTokens()
	}

	return (
		<div id="content" className="mt-5">
			<div className="text-center">
				<h1>Token Farm</h1>
				<p className="lead">
					Stake some mock DAI tokens and receive rewards as interest in the form of our custom DApp
					Tokens.
				</p>
			</div>
			<table className="table table-borderless text-muted text-center">
				<thead>
					<tr>
						<th scope="col">Staking Balance</th>
						<th scope="col">Reward Balance</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>{window.web3.utils.fromWei(stakingBalance, 'ether')} mDAI</td>
						<td>{window.web3.utils.fromWei(dappTokenBalance, 'ether')} DApp</td>
					</tr>
				</tbody>
			</table>
			<div className="card mb-4">
				<div className="card-body">
					<form className="mb-3" onSubmit={handleSubmit}>
						<div>
							<label className="float-left">
								<strong>Stake Tokens</strong>
							</label>
							<span className="float-right text-muted">
								Balance: {window.web3.utils.fromWei(daiTokenBalance, 'ether')}
							</span>
						</div>
						<div className="input-group mb-4">
							<input
								type="text"
								onChange={e => setStakeValue(e.target.value)}
								value={stakeValue}
								className="form-control form-control-lg"
								placeholder="0"
								required
							/>
							<div className="input-group-append">
								<div className="input-group-text">
									<img src={dai} height="32" alt="" />
									&nbsp;&nbsp;&nbsp; mDAI
								</div>
							</div>
						</div>
						<button type="submit" className="btn btn-info btn-block btn-lg">
							STAKE!
						</button>
					</form>
					<button type="submit" className="btn btn-link btn-block btn-sm" onClick={handleWithdraw}>
						Withdraw...
					</button>
				</div>
			</div>
		</div>
	)
}

Main.propTypes = {
	daiTokenBalance: PropTypes.string.isRequired,
	dappTokenBalance: PropTypes.string.isRequired,
	stakingBalance: PropTypes.string.isRequired,
	stakeTokens: PropTypes.func.isRequired,
	unstakeAllTokens: PropTypes.func.isRequired,
}

export default Main
