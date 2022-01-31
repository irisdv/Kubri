import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { StarknetERC1155State } from "./model";
import { useStarknet } from "../StarknetProvider";
import { stark, shortString, number } from 'starknet';
const { getSelectorFromName } = stark;
const { decodeShortString, encodeShortString } = shortString;
const { hexToDecimalString } = number;
import { useAsyncState, AsyncState } from '../UseAsyncState/useAsyncState';
import StarknetBridged1155 from '../../lib/abi/bridged1155.summary.json';
import StarknetGateway1155 from '../../lib/abi/gateway1155.summary.json';
import { ethers, BigNumber } from 'ethers';
import { TWO } from "starknet/dist/constants";
// import { useEthers } from '@usedapp/core';
// import { useStarknetCall, useStarknetInvoke } from "../../lib/hooks";

interface StarknetERC1155ManagerState {
	address: string;
	l1_address: string;
	valid: boolean;
    tokenURI: string;
	ownedTokens: string[];
	ownedNFT: {}[];
    nextTokenID: string;
	approvalTx: string;
	approvedGateway: boolean;
	bridgingTx: string;
}

interface SetAddress {
    type: "set_address";
    address: string;
}
interface SetL1Address {
    type: "set_l1_address";
    l1_address: string;
}
interface SetValid {
    type: "set_valid";
    valid: boolean;
}
interface SetTokenURI {
    type: "set_uri";
    tokenURI: string;
}
interface SetOwnedTokens {
    type: "set_owned_tokens";
    ownedTokens: string[];
}
interface SetOwnedNFT {
    type: "set_owned_nft";
    ownedNFT: {}[];
}
interface setNextTokenID {
    type: "set_next_token_id";
    nextTokenID: string;
}
interface setApprovalTx {
    type: "set_approval_tx";
    approvalTx: string;
}
interface SetApprovedGateway {
    type: "set_approved_gateway";
    approvedGateway: boolean;
}

type Action = SetAddress | SetL1Address | SetValid | SetTokenURI | SetOwnedTokens | setNextTokenID | setApprovalTx | SetApprovedGateway | SetOwnedNFT;

function reducer(
    state: StarknetERC1155ManagerState,
    action: Action
  ): StarknetERC1155ManagerState {
    switch (action.type) {
      case "set_address": {
        return { ...state, address: action.address };
      }
      case "set_l1_address": {
        return { ...state, l1_address: action.l1_address };
      }
      case "set_valid": {
        return { ...state, valid: action.valid };
      }
      case "set_uri": {
        return { ...state, tokenURI: action.tokenURI };
      }
      case "set_owned_tokens": {
        return { ...state, ownedTokens: action.ownedTokens };
      }
	  case "set_owned_nft": {
        return { ...state, ownedNFT: action.ownedNFT };
      }
      case "set_next_token_id": {
        return { ...state, nextTokenID: action.nextTokenID };
      }
	  case "set_approval_tx": {
        return { ...state, approvalTx: action.approvalTx };
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

export function useStarknetERC1155Manager() : StarknetERC1155State {
    const starknet = useStarknet();
    const [timer, setTimer] = useState(Date.now());
	// const [totalSupply, setTotalSupply] = useAsyncState(BigNumber.from(0));
	// const [userBalance, setUserBalance] = useAsyncState(0);
	const [RownedTokens, setROwnedTokens] = useAsyncState([]);
	const [RnextTokenID, setRNextTokenID] = useAsyncState(BigNumber.from(0));

    const [state, dispatch] = React.useReducer(reducer, {
        address: '',
        l1_address: '',
        valid: false,
        tokenURI: '',
        ownedTokens: [],
		ownedNFT: [{}],
        nextTokenID: '0',
		approvalTx: '',
		approvedGateway: false,
		bridgingTx: '',
      });
    const {address, l1_address, valid, tokenURI, ownedTokens, ownedNFT, nextTokenID, approvalTx, approvedGateway, bridgingTx } = state;

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
		if (starknet.starknet && starknet.account && address && !fetching(RownedTokens, RnextTokenID)) {
            RownedTokens.setFetching();
            RnextTokenID.setFetching();

			console.log('tried fetching');
			console.log('state ', state.ownedTokens)
            
			setTimeout(
				async () => {
					let _ownedTokens;
					try {
						_ownedTokens = await starknet.starknet.provider.callContract(
							{
								contract_address: address,
								entry_point_selector: getSelectorFromName('get_all_token_by_owner'),
								calldata: [BigNumber.from(starknet.account).toString()]
							}
						)
                        console.log('_ownedTokens = ', _ownedTokens);
					} catch (e) {
						console.warn('Error when retrieving get_all_token_by_owner')
						console.warn(e)
					}
					if (_ownedTokens?.result && _ownedTokens.result != RownedTokens) {
						setRNextTokenID(_ownedTokens?.result);
						dispatch({ type: "set_owned_tokens", ownedTokens: _ownedTokens?.result });
					}

					let _nextTokenID;
					try {
						_nextTokenID = await starknet.starknet.provider.callContract(
							{
								contract_address: address,
								entry_point_selector: getSelectorFromName('get_next_token_id'),
								calldata: []
							}
						)
                        console.log('_nextTokenID = ', _nextTokenID);
					} catch (e) {
						console.warn('Error when retrieving get_next_token_id')
						console.warn(e)
					}
					if (_nextTokenID?.result && _nextTokenID.result != nextTokenID) {
						console.log('next token ID is ', _nextTokenID?.result);
						setRNextTokenID(_nextTokenID?.result);
						dispatch({ type: "set_next_token_id", nextTokenID: _nextTokenID?.result[0] });
					}
					
					RownedTokens.setNotFetching();
                    RnextTokenID.setNotFetching();
				}, 0);
			}

	}, [timer, starknet.starknet, starknet.account, address]);

	// récupérer la liste des URI
	useEffect(() => {

		if (starknet.starknet && starknet.account && ownedTokens.length > 0) {
			const finalURI = [{}];

			// dispatch({ type: "set_owned_nft", ownedNFT: finalURI });
		}
	}, [starknet.starknet, starknet.account, ownedTokens, ownedNFT])

    const mint1155NFT = useCallback(async (tokensId: number[], amounts: number[], uri: string) => {
		if (starknet.starknet && starknet.account) {

			// console.log('tokensId', tokensId);
			// console.log('amounts', amounts);
			// console.log('uri', uri);

			const uri_a = uri.substring(0, 31);
			const uri_b = uri.substring(31, uri.length);
			if (uri_a.length > 31 || uri_b.length > 31) {
				console.log('string too long!!');
			} else {
				console.log('string has right length');
			}
			const uritable = [encodeShortString(uri_a), encodeShortString(uri_b)];

			const tx = await starknet.starknet.signer.invokeFunction(
				address,
				getSelectorFromName('mint_nft_batch_with_uri'),
				[
					BigNumber.from(starknet.account).toString(),
					tokensId,
					amounts,
					uritable
				]
			);
			console.log('tx', tx);
			return tx;
		}
	}, [starknet.starknet, starknet.account]);

	// useEffect(() => {
	// 	if (starknet.starknet && starknet.starknet && approvalTx && approvedGateway == false) {
	// 		setTimeout(async () => {
	// 			try {
	// 				const txStatus = await starknet.starknet.signer.getTransactionStatus(approvalTx)
	// 				console.log('tx status object', txStatus);
					
	// 				if (txStatus && (txStatus.tx_status == 'ACCEPTED_ON_L1' || txStatus.tx_status == 'ACCEPTED_ON_L2')) {
	// 					console.log('status approval accepted on L1 or L2');
	// 					dispatch({ type: "set_approved_gateway", approvedGateway: true});
	// 				} else if (txStatus && txStatus.tx_status == 'REJECTED') {
	// 					console.log('status approval rejected');
	// 					dispatch({ type: "set_approval_tx", approvalTx: ''});
	// 				}
	// 				console.log('tx object status object 33', txStatus.tx_status);
	// 			} catch (e) {
	// 				console.log('error', e);
	// 			}
	// 		}, 0);
	// 	}
	// }, [starknet.starknet, starknet.account, approvalTx, approvedGateway])

	useEffect(() => {
		if (starknet.starknet && starknet.account && address && !approvalTx && approvedGateway == false) {
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
				if (_hasBeenApproved && _hasBeenApproved.result && _hasBeenApproved.result[0] && parseInt(hexToDecimalString(_hasBeenApproved.result[0])) == 1) {
					dispatch({ type: "set_approved_gateway", approvedGateway: true });
				}
			}, 0);
		}
	}, [starknet.starknet, starknet.account, address, approvalTx, approvedGateway])

	const approveUser = useCallback( async () => {
		if (starknet.starknet && starknet.account) {

			const tx = await starknet.starknet.signer.invokeFunction(
				address,
				getSelectorFromName('set_approval_for_all'),
				[BigNumber.from(StarknetGateway1155.address).toString(), 1]
			)
			console.log('tx', tx);
			dispatch({ type: "set_approval_tx", approvalTx: tx.transaction_hash });
			return tx;
		}
	}, [starknet.starknet, starknet.account]) 

    // Set up function Bridge to L1
	const bridgeToL1 = useCallback(async (tokenId: [], amounts: []) => {

		if (starknet.starknet && l1_address && starknet.gateway) {
			const tx = await starknet.starknet.signer.invokeFunction(
				starknet.gateway,
				getSelectorFromName('bridge_to_mainnet'),
				[
					BigNumber.from(l1_address).toString(),
					BigNumber.from(address).toString(),
					tokenId,
					amounts,
					BigNumber.from('0x9524F1f9F002a7FE810d47C940Eb7D34668023d7').toString()
				]
			);
			console.log(tx);
		}

	}, [l1_address, starknet.account, starknet.gateway, starknet.starknet]);

    return {address, l1_address, valid, tokenURI, ownedTokens, ownedNFT, nextTokenID, approvalTx, approvedGateway, bridgingTx, mint1155NFT, bridgeToL1, approveUser};

}