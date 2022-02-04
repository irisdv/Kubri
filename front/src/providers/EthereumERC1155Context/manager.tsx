import React, { useCallback, useEffect, useState } from "react";
import { EthereumERC1155State } from "./model";
import { TransactionStatus, useContractCall, useContractFunction, useEthers } from '@usedapp/core';
import { AsyncState } from '../UseAsyncState/useAsyncState';
import StarknetBridged1155 from '../../lib/abi/bridged1155.summary.json';
import StarknetGateway1155 from '../../lib/abi/gateway1155.summary.json';
import { Contract } from "@usedapp/core/node_modules/ethers";
import { Gateway1155Abi } from "../../libSolidity/abi/Gateway1155ABI.abi";
import SolidityGateway1155 from "../../libSolidity/abi/Gateway1155.summary.json"
import SolidityBridge1155 from "../../libSolidity/abi/Bridge1155.summary.json"
import { utils } from "ethers";

interface EthereumERC1155ManagerState {
    l1_address: string;
    l1_token_address: string
    abi: utils.Interface;
    l2_address: string;
    l2_token_address: string;
}

interface SetL1Address {
    type: "set_l1_address";
    l1_address: string;
}
interface SetL1TokenAddress {
    type: "set_l1_token_address";
    l1_token_address: string;
}
interface SetAbi {
    type: "set_abi";
    abi: utils.Interface;
}
interface SetL2Address {
    type: "set_l2_address";
    l2_address: string;
}
interface SetL2TokenAddress {
    type: "set_l2_token_address";
    l2_token_address: string;
}


type Action = SetL1Address | SetL1TokenAddress | SetAbi | SetL2Address | SetL2TokenAddress;

function reducer(
    state: EthereumERC1155ManagerState,
    action: Action
): EthereumERC1155ManagerState {
    switch (action.type) {
        case "set_abi": {
            return { ...state, abi: action.abi };
        }
        case "set_l1_address": {
            return { ...state, l1_address: action.l1_address };
        }
        case "set_l1_token_address": {
            return { ...state, l1_token_address: action.l1_token_address };
        }
        default: {
            return state;
        }
    }
}

const fetching = (...args: AsyncState[]): boolean => {
    return args.map(v => v.fetching).filter(v => v === true).length > 0
}

export function useEthereumERC1155Manager(): EthereumERC1155State {

    const ethers = useEthers();
    const [timer, setTimer] = useState(Date.now());
    const [txHash, setTxHash] = useState("");
    const [state, dispatch] = React.useReducer(reducer, {
        l1_address: '',
        l1_token_address: '',
        abi: new utils.Interface(Gateway1155Abi),
        l2_address: '',
        l2_token_address: '',
    });
    const { l1_address, l1_token_address, abi, l2_address, l2_token_address } = state;

    useEffect(() => {
        const tid = setTimeout(() => {
            setTimer(Date.now())
        }, 5000);
        return () => {
            clearTimeout(tid)
        }
    }, [])

    // useEffect(() => {
    //     if (StarknetGateway1155) {
    //         dispatch({ type: "set_l2_address", l2_address: StarknetGateway1155.address });
    //     }
    // }, [StarknetGateway1155, l2_address])

    // useEffect(() => {
    //     if (StarknetBridged1155) {
    //         dispatch({ type: "set_l2_token_address", l2_token_address: StarknetBridged1155.address });
    //     }
    // }, [StarknetBridged1155, l2_token_address])

    useEffect(() => {
        if (SolidityBridge1155) {
            dispatch({ type: "set_l1_token_address", l1_token_address: SolidityBridge1155.address });
        }
    }, [SolidityBridge1155, l1_token_address])

    useEffect(() => {
        if (SolidityGateway1155) {
            dispatch({ type: "set_l1_address", l1_address: SolidityGateway1155.address });
        }
    }, [SolidityGateway1155, l1_address])


    // useEffect(() => {
    //     if ( approvalTx && approvedConsumeMsg == false) {
    //         setTimeout(async () => {
    //             try {
    //                 const txStatus = await starknet.starknet.signer.getTransactionStatus(approvalTx)
    //                 console.log('tx status object', txStatus);

    //                 if (txStatus && (txStatus.tx_status == 'ACCEPTED_ON_L2' || txStatus.tx_status == 'ACCEPTED_ON_L2')) {
    //                     console.log('status approval accepted on l2 or L2');
    //                     dispatch({ type: "set_approved_consume_msg", approvedConsumeMsg: true });
    //                 } else if (txStatus && txStatus.tx_status == 'REJECTED') {
    //                     console.log('status approval rejected');
    //                     dispatch({ type: "set_approval_tx", approvalTx: '' });
    //                 }
    //                 console.log('tx object status object 33', txStatus.tx_status);
    //             } catch (e) {
    //                 console.log('error', e);
    //             }
    //         }, 0);
    //     }
    // }, [approvalTx, approvedConsumeMsg])



    // const setEndpointGateway = useCallback(async () => {
    //     const tx = useContractCall({
    //         method: 'setEndpointGateway',
    //         args: [l2_address],
    //         address: address,
    //         abi: abi
    //     })
    //     return (tx)
    // }, [l2_address, address]);


    // MINT NFT ON L1
    const { send: mintSend, state: mintState } = useContractFunction(new Contract(SolidityGateway1155.address, Gateway1155Abi, ethers.library), 'mintNFTFromStarknet', { transactionName: "mint NFT From Starknet" });

    const mintFromL2 = useCallback(async (tokenId: [], amounts: []) => {
        console.log("TOKENS LIST:", tokenId)
        console.log("AMOUNTS LIST:", amounts)

        mintSend(tokenId, amounts)
        // dispatch({ type: "set_approval_tx", approvalTx: mintState });

    }, [mintSend]);

    React.useEffect(() => {
        console.log("Herre", mintState.transaction?.hash)
        if (mintState.transaction?.hash) {
            setTxHash(mintState.transaction?.hash)
        }
    }, [mintState.transaction?.hash])

    // Set up function Bridge to l2

    const { send: bridgeSend, state: bridgeState } = useContractFunction(new Contract(SolidityGateway1155.address, Gateway1155Abi, ethers.library), 'bridgeFromStarknet', { transactionName: "Bridge NFT From Starknet" });

    const bridgeFromL2 = useCallback(async (tokenId: [], amounts: []) => {
        console.log("L1TOKEN:", SolidityBridge1155.address)
        console.log("L2TOKEN:", StarknetBridged1155.address)

        bridgeSend(SolidityBridge1155.address, StarknetBridged1155.address, tokenId, amounts)
        // dispatch({ type: "set_approval_tx", approvalTx: bridgeState });

    }, [bridgeSend, SolidityBridge1155.address, StarknetBridged1155.address]);

    React.useEffect(() => {
        if (bridgeState.transaction?.hash) {
            setTxHash(bridgeState.transaction?.hash)
        }
    }, [bridgeState.transaction?.hash])


    return { l1_address, l1_token_address, l2_address, l2_token_address, txHash, bridgeFromL2, bridgeState, mintFromL2, mintState };

}