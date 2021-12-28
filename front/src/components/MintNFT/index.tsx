import React from "react";
import { Contract } from "starknet";
import { useStarknetInvoke } from "../../lib/hooks";
import { useStarknet } from "../../providers/StarknetProvider";
import { useTransaction } from "../../providers/TransactionsProvider";

import { Button, Input, Row, Col } from 'antd';

export function InitializeNFT({ contract }: { contract?: Contract }) {
    const { account } = useStarknet();
    // console.log(account);
    const [to, setTo] = React.useState(account);
    const [tokensId, setTokensId] = React.useState(["0x01", "0x02"]);
    const [amounts, setAmounts] = React.useState(["0x03", "0x02"]);
    const {
        invoke: initialize_nft_batch,
        hash,
        submitting
    } = useStarknetInvoke(contract, "initialize_nft_batch");
    const transactionStatus = useTransaction(hash);


    // console.log(to);
    // const [amount, setAmount] = React.useState("0x1");

    // const updateID = React.useCallback(
    //     (evt: React.ChangeEvent<HTMLInputElement>) => {
    //         setTokenId(evt.target.value);
    //     },
    //     [setTokenId]
    // );

    if (!account) return null;

    return (
        <div>
            <Row style={{ padding: '10px', justifyContent: 'center' }}>
                <Button
                    type="primary"
                    onClick={() => initialize_nft_batch && initialize_nft_batch({ to, tokens_id_len: "2", tokensId, amounts_len: "2", amounts })}
                    style={{ backgroundColor: '#002766', borderColor: '#002766' }}
                >Mint NFT</Button>
            </Row>
        </div>
    );
}
