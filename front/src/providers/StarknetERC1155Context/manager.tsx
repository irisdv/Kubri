import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { StarknetERC1155State } from "./model";
import { useStarknet } from "../StarknetProvider";
import { stark, shortString, number } from 'starknet';
const { getSelectorFromName } = stark;
// const { decodeShortString, encodeShortString } = shortString;
const { hexToDecimalString } = number;
import { useAsyncState, AsyncState } from '../UseAsyncState/useAsyncState';
import StarknetBridged1155 from '../../lib/abi/bridged1155.summary.json';
import StarknetGateway1155 from '../../lib/abi/gateway1155.summary.json';
import { ethers, BigNumber } from 'ethers';
// import { TWO } from "starknet/dist/constants";

interface StarknetERC1155ManagerState {
	address: string;
	valid: boolean;
	balanceOf1: string;
	balanceOf2: string;
	approvalTx: string;
	approvedGateway: boolean;
	bridgingTx: string;
}

interface SetAddress {
	type: "set_address";
	address: string;
}
interface SetValid {
	type: "set_valid";
	valid: boolean;
}
interface SetBalanceOf1 {
	type: "set_balance_of_1";
	balanceOf1: string;
}
interface SetBalanceOf2 {
	type: "set_balance_of_2";
	balanceOf2: string;
}
interface setApprovalTx {
	type: "set_approval_tx";
	approvalTx: string;
}
interface SetApprovedGateway {
	type: "set_approved_gateway";
	approvedGateway: boolean;
}

interface SetBridgingTx {
	type: "set_bridging_tx";
	bridgingTx: string;
}


type Action = SetAddress | SetValid | SetBalanceOf1 | SetBalanceOf2 | setApprovalTx | SetApprovedGateway | SetBridgingTx;

function reducer(
	state: StarknetERC1155ManagerState,
	action: Action
): StarknetERC1155ManagerState {
	switch (action.type) {
		case "set_address": {
			return { ...state, address: action.address };
		}
		case "set_valid": {
			return { ...state, valid: action.valid };
		}
		case "set_balance_of_1": {
			return { ...state, balanceOf1: action.balanceOf1 };
		}
		case "set_balance_of_2": {
			return { ...state, balanceOf2: action.balanceOf2 };
		}
		case "set_approval_tx": {
			return { ...state, approvalTx: action.approvalTx };
		}
		case "set_bridging_tx": {
			return { ...state, bridgingTx: action.bridgingTx };
		}
		case "set_approved_gateway": {
			return { ...state, approvedGateway: action.approvedGateway };
		}
		default: {
			return state;
		}
	}
}

const fetching = (...args: AsyncState[]): boolean => {
	return args.map(v => v.fetching).filter(v => v === true).length > 0
}

export function useStarknetERC1155Manager(): StarknetERC1155State {
	const starknet = useStarknet();
	const [timer, setTimer] = useState(Date.now());
	const [balance1, setBalance1] = useAsyncState('');
	const [balance2, setBalance2] = useAsyncState('');

	const [state, dispatch] = React.useReducer(reducer, {
		address: '',
		valid: false,
		balanceOf1: '',
		balanceOf2: '',
		approvalTx: '',
		approvedGateway: false,
		bridgingTx: '',
	});
	const { address, valid, balanceOf1, balanceOf2, approvalTx, approvedGateway, bridgingTx } = state;

	useEffect(() => {
		const tid = setTimeout(() => {
			setTimer(Date.now())
		}, 5000);
		return () => {
			clearTimeout(tid)
		}
	}, [])

	useEffect(() => {
		if (StarknetBridged1155) {
			dispatch({ type: "set_address", address: StarknetBridged1155.address });
		}
	}, [StarknetBridged1155, address])

	useEffect(() => {
		if (starknet.starknet && starknet.account && address && !fetching(balance1, balance2)) {
			balance1.setFetching();
			balance2.setFetching();

			console.log('tried fetching');

			setTimeout(
				async () => {
					let _balance1;
					try {
						_balance1 = await starknet.starknet.provider.callContract(
							{
								contract_address: address,
								entry_point_selector: getSelectorFromName('balance_of'),
								calldata: [BigNumber.from(starknet.account).toString(), '1']
							}
						)
					} catch (e) {
						console.warn('Error when retrieving balance_of for token_id=1')
						console.warn(e)
					}
					if (_balance1?.result && _balance1.result[0] != balance1) {
						console.log('balance1', hexToDecimalString(_balance1.result[0]));
						setBalance1(_balance1?.result[0]);
						dispatch({ type: "set_balance_of_1", balanceOf1: hexToDecimalString(_balance1.result[0]) });
					}

					let _balance2;
					try {
						_balance2 = await starknet.starknet.provider.callContract(
							{
								contract_address: address,
								entry_point_selector: getSelectorFromName('balance_of'),
								calldata: [BigNumber.from(starknet.account).toString(), '2']
							}
						)
					} catch (e) {
						console.warn('Error when retrieving balance_of for token_id=2')
						console.warn(e)
					}
					if (_balance2?.result && _balance2.result[0] != balance2) {
						console.log('balance2', hexToDecimalString(_balance2.result[0]));
						setBalance2(_balance2?.result[0]);
						dispatch({ type: "set_balance_of_2", balanceOf2: hexToDecimalString(_balance2.result[0]) });
					}

					balance1.setNotFetching();
					balance2.setNotFetching();
				}, 0);
		}

	}, [timer, starknet.starknet, starknet.account, address]);

	useEffect(() => {
		if (starknet.starknet && starknet.account && address && approvedGateway == false) {
			console.log('dans use effect approval');
			setTimeout(async () => {
				let _hasBeenApproved;
				try {
					_hasBeenApproved = await starknet.starknet.provider.callContract({
						contract_address: address,
						entry_point_selector: getSelectorFromName('is_approved_for_all'),
						calldata: [
							BigNumber.from(starknet.account).toString(),
							BigNumber.from(StarknetGateway1155.address).toString()
						]
					})
					console.log('hasBeenApproved', _hasBeenApproved.result[0]);

				} catch (e) {
					console.log('error', e);
				}
				console.log()
				if (_hasBeenApproved && _hasBeenApproved.result && _hasBeenApproved.result[0] && parseInt(hexToDecimalString(_hasBeenApproved.result[0])) == 1) {
					console.log("IS APPROVED if statement")
					dispatch({ type: "set_approved_gateway", approvedGateway: true });
				}
			}, 0);
		}
	}, [starknet.starknet, starknet.account, address, approvalTx, approvedGateway])

	const approveUser = useCallback(async (_address: string) => {
		if (starknet.starknet && starknet.account) {

			const tx = await starknet.starknet.signer.invokeFunction(
				_address,
				getSelectorFromName('set_approval_for_all'),
				[BigNumber.from(StarknetGateway1155.address).toString(), 1]
			)
			console.log('tx', tx);
			dispatch({ type: "set_approval_tx", approvalTx: tx.transaction_hash });
			return tx;
		}
	}, [starknet.starknet, starknet.account])

	// Set up function Bridge to L1
	// useEffect(() => {
	// 	if (starknet.starknet && starknet.account && bridgingTx) {
	// 		setTimeout(async () => {
	// 			let _hasBeenApproved;
	// 			try {
	// 				_hasBeenApproved = await starknet.starknet.provider.callContract({
	// 					contract_address: address,
	// 					entry_point_selector: getSelectorFromName('is_approved_for_all'),
	// 					calldata: [
	// 						BigNumber.from(starknet.account).toString(),
	// 						BigNumber.from(StarknetGateway1155.address).toString()
	// 					]
	// 				})
	// 				console.log('hasBeenApproved', _hasBeenApproved.result[0]);

	// 			} catch (e) {
	// 				console.log('error', e);
	// 			}
	// 			if (_hasBeenApproved && _hasBeenApproved.result && _hasBeenApproved.result[0] && parseInt(hexToDecimalString(_hasBeenApproved.result[0])) == 1) {
	// 				console.log("IS APPROVED")
	// 				dispatch({ type: "set_approved_gateway", approvedGateway: true });
	// 			}
	// 		}, 0);
	// 	}
	// }, [starknet.starknet, starknet.account, bridgingTx])

	const bridgeToL1 = useCallback(async (tokenId: [], amounts: [], _l1_token_address: string, metamaskAccount: string) => {

		if (starknet.starknet && starknet.gateway) {
			let calldata = [BigNumber.from(_l1_token_address).toString(),
			BigNumber.from(address).toString(), tokenId.length]
			tokenId.forEach(element => calldata.push(element));
			calldata.push(amounts.length);
			amounts.forEach(element => calldata.push(element));
			calldata.push(BigNumber.from(metamaskAccount).toString());
			const tx = await starknet.starknet.signer.invokeFunction(
				starknet.gateway,
				getSelectorFromName('bridge_to_mainnet'),
				calldata,
				// [
				// 	BigNumber.from(_l1_token_address).toString(),
				// 	BigNumber.from(address).toString(),
				// 	tokenId.length,
				// 	tokenId.at(0),
				// 	tokenId.at(1),
				// 	amounts.length,
				// 	amounts.at(0),
				// 	amounts.at(1),
				// 	BigNumber.from(metamaskAccount).toString()
				// ]
			);
			console.log(tx);
			dispatch({ type: "set_bridging_tx", bridgingTx: tx.transaction_hash });
			return tx;
		}

	}, [starknet.account, starknet.gateway, starknet.starknet]);

	return { address, valid, balanceOf1, balanceOf2, approvalTx, approvedGateway, bridgingTx, bridgeToL1, approveUser };

}