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

export function Mint1155NFT({ contract }: { contract?: Contract }) {
    const { account } = useStarknet();
    const [to, setTo] = React.useState(account);
    const [tokensId, setTokensId] = React.useState(["0x01", "0x02"]);
    const [amounts, setAmounts] = React.useState(["0x70", "0x40"]);
    const uri_low = "bafybeifvckoqkr7wmk55ttuxg2ry"
    const uri_hi = "tfojrfihiqoj5h5wjt5jtkqwnkxbie"
    const uri = (uri_low + uri_hi)
    const {
        invoke: mint_nft_batch_with_uri,
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
                    onClick={() => mint_nft_batch_with_uri && mint_nft_batch_with_uri({ to, tokensId, amounts, uri })}
                // style={{ backgroundColor: '#002766', borderColor: '#002766' }}
                >Mint NFTs</button>
            </div>
        </div>
    );
}
