import React, { useCallback, useEffect, useState } from "react";
import { StarknetERC1155State } from "./model";
import { useStarknet } from "../StarknetProvider";
import { stark } from 'starknet';
const { getSelectorFromName } = stark;
import { useBridged1155Contract } from "../../lib/bridged1155";
import { useAsyncState, AsyncState } from '../UseAsyncState/useAsyncState';
import StarknetBridged1155 from '../../lib/abi/bridged1155.summary.json';
import { ethers, BigNumber } from 'ethers';
// import { useEthers } from '@usedapp/core';
// import { useStarknetCall, useStarknetInvoke } from "../../lib/hooks";


interface StarknetERC1155ManagerState {
	address: string;
	l1_address: string;
	valid: boolean;
    tokenURI: string;
	ownedTokens: string[];
    nextTokenID: BigNumber;
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
interface setNextTokenID {
    type: "set_next_token_id";
    nextTokenID: BigNumber;
}

type Action = SetAddress | SetL1Address | SetValid | SetTokenURI | SetOwnedTokens | setNextTokenID;

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
      case "set_next_token_id": {
        return { ...state, nextTokenID: action.nextTokenID };
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
    const starknetBridged1155Contract = useBridged1155Contract();
    const [timer, setTimer] = useState(Date.now());

	// const [totalSupply, setTotalSupply] = useAsyncState(BigNumber.from(0));
	// const [userBalance, setUserBalance] = useAsyncState(0);
	const [RownedTokens, setROwnedTokens] = useAsyncState([]);
	const [RtokenURI, setRTokenURI] = useAsyncState('');
	const [RnextTokenID, setRNextTokenID] = useAsyncState(BigNumber.from(0));

    const [state, dispatch] = React.useReducer(reducer, {
        address: '',
        l1_address: '',
        valid: false,
        tokenURI: '',
        ownedTokens: [],
        nextTokenID: BigNumber.from(0),
      });
    const {address, l1_address, valid, tokenURI, ownedTokens, nextTokenID } = state;

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
		if (starknet.starknet && starknet.account && !fetching(RownedTokens, RtokenURI, RnextTokenID)) {
            // RownedTokens.setFetching();
            RtokenURI.setFetching();
            RnextTokenID.setFetching();

			console.log('tried fetching');
            
			setTimeout(
				async () => {
					let _tokenURI 
					try {
						_tokenURI = await starknet.starknet.provider.callContract(
							{
								contract_address: address,
								entry_point_selector: getSelectorFromName('uri'),
								calldata: []
							}
						)
                        console.log('_tokeURI dans context = ', _tokenURI);
					} catch (e) {
						console.warn('Error when retrieving balance_of')
						console.warn(e)
					}
					if (_tokenURI?.result && _tokenURI?.result != tokenURI) {
						console.log('token uri is', _tokenURI.result);
						// dispatch({ type: "set_next_token_id", nextTokenID: _nextTokenID?.result });
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
						dispatch({ type: "set_next_token_id", nextTokenID: _nextTokenID?.result });
					}
	
					// RownedTokens.setNotFetching();
                    RtokenURI.setNotFetching();
                    RnextTokenID.setNotFetching();
				}, 0);
			}

	}, [timer, starknet.starknet, starknet.account]);

    const mint1155NFT = useCallback(async (_address : string, tokensId: any[], amounts: any[], uri: string) => {

		console.log('in Mint1155NFT with contract address = ', address);

		if (starknet.starknet) {

			console.log('tokensId', tokensId);
			console.log('amounts', amounts);
			console.log('uri', uri);

			const tx = await starknet.starknet.signer.invokeFunction(
				_address,
				getSelectorFromName('mint_nft_batch_with_uri'),
				[
					tokensId,
					amounts,
					['bafybeifvckoqkr7wmk55ttuxg2ry','tfojrfihiqoj5h5wjt5jtkqwnkxbie']
				]
			);
			console.log('tx', tx);
			return tx;
			
		}

	}, [starknet.starknet, tokenURI]);

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
					BigNumber.from('ethereum wallet address').toString() // add ethereum account
				]
			);
			console.log(tx);
		}

	}, [l1_address, starknet.account, starknet.gateway, starknet.starknet]);



    return {address, l1_address, valid, tokenURI, ownedTokens, nextTokenID, bridgeToL1, mint1155NFT};

}