import React, { useEffect } from "react";
import { Contract } from "starknet";
import { useStarknetInvoke } from "../../lib/hooks";

import { useStarknet } from "../../providers/StarknetProvider";
import { useTransaction } from "../../providers/TransactionsProvider";

import { useBridged1155Contract } from "../../lib/bridged1155";

interface TFormArray {
    name?: string;
    description?: string;
    supply?: string;
    image?: string;
    imgHeight?: number;
    imgWidth?: number;
    attributes?: {
        type?: string;
        value?: string;
    }
}

export function Mint1155NFT({ contract, supply, tokensID, uri }: { contract?: Contract, supply?: any, tokensID?: any, uri?: any }) {
    const { account } = useStarknet();
    const [to, setTo] = React.useState(account);
    const {
        invoke: initialize_nft_batch,
        hash,
        submitting
    } = useStarknetInvoke(contract, "mint_nft_batch_with_uri");
    const transactionStatus = useTransaction(hash);

    // console.log('amounts', supply);
    // console.log('tokensID', tokensID);
    // console.log('uri', uri);

    if (!account) return null;

    return (
        <div>
            <div style={{ padding: '10px', justifyContent: 'center' }}>
                <button
                    className="btn btn-accent"
                    onClick={() => initialize_nft_batch && initialize_nft_batch({ to, tokensID, supply, uri })}
                    // style={{ backgroundColor: '#002766', borderColor: '#002766' }}
                >Mint NFTs</button>
            </div>
        </div>
    );
}
