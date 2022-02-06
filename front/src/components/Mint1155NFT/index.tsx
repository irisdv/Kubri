import React, { useEffect, useState } from "react";
import { Contract } from "starknet";
import { useStarknetInvoke } from "../../lib/hooks";
import { useStarknetERC1155Manager } from '../../providers/StarknetERC1155Context';

import { useStarknet } from "../../providers/StarknetProvider";
import { useTransaction } from "../../providers/TransactionsProvider";


export function Mint1155NFT({ contract }: { contract?: Contract }) {
    const { account } = useStarknet();
    // const { mint1155NFT } = useStarknetERC1155Manager();
    const [minting, setMinting] = useState(0);
    const supply = [5,10];
    const tokensID = [1,2];

    // const [to, setTo] = React.useState(account);
    const {
        invoke: initialize_nft_batch,
        hash,
        submitting
    } = useStarknetInvoke(contract, "initialize_nft_batch");
    const transactionStatus = useTransaction(hash);

    console.log('submitting', submitting);

    // React.useEffect(() => {
    //     if (minting==1 && !submitting) {
    //       console.log('minted = 1 && pas submitting');
    //       if (transactionStatus && (transactionStatus.code == 'REJECTED')) {
    //         setMinted(2)
    //         console.log('dans if');
    //       } else if (submitting == false && transactionStatus && (transactionStatus.code == 'ACCEPTED_ON_L1' || transactionStatus.code == 'ACCEPTED_ON_L2')) {
    //         setStep(1);
    //         console.log('dans else');
    //       }
    //     }
    //   }, [stored, minted, submitting, transactionStatus])


    // React.useEffect(() => {
    //     if (approvalState == 0 && approvedGateway == true) {
    //         setApprovalState(2);
    //     }
    //     if (approvalState == 1) {
    //         console.log('approval ongoing');
    //         var data = transactions.filter((transactions) => (transactions.hash) === approvalTx);
    //         console.log('data', data);
    //         if (data && data[0] && data[0].code && (data[0].code == 'REJECTED')) {
    //             setApprovalState(0)
    //         } else if (data && data[0] && (data[0].code == 'ACCEPTED_ON_L1' || data[0].code == 'ACCEPTED_ON_L2')) {
    //             console.log('tx pour set approval est bien passée on peut passer au bridge')
    //             setApprovalState(2);
    //         }
    //     }
    // }, [approvalState, transactions, approvalTx, approvedGateway])

    const MintNFT = async (tokensID: [], supplyTokens: []) => {
        setMinting(1);
        // const tx = await mint1155NFT(tokensID, supplyTokens);
        // // @ts-ignore
        // if (tx && tx.transaction_hash) {
        //     // @ts-ignore
        //     addTransaction(tx);
        // }
        if (initialize_nft_batch) {
            initialize_nft_batch({ account, tokensID, supplyTokens });
            console.log('transactionStatus', transactionStatus);
            // console.log('transactions', transactions);
        }
    }

    return (
        <div>
            <div style={{ padding: '10px', justifyContent: 'center' }}>
                <button
                    className={minting == 0 ? "btn btn-accent my-2" : "btn btn-accent my-2 loading"}
                    onClick={() => initialize_nft_batch && initialize_nft_batch({ account, tokensID, supply })}
                >Mint batch of NFTs</button>
            </div>
        </div>
    );
}
