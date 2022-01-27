import React from "react";
import { useStarknetInvoke } from "../../lib/hooks";
import { useStarknet } from "../../providers/StarknetProvider";
import { useTransaction } from "../../providers/TransactionsProvider";
import { Contract } from "starknet";
import { Button, Row } from 'antd';

export function ConsumeMint({ contract, tokensId, amounts }: { contract?: Contract, tokensId?: any, amounts: any }) {
    const { account } = useStarknet();

    const l1TokenAddress = process.env.REACT_APP_L1_ERC1155
    const l2TokenAddress = process.env.REACT_APP_L2_ERC1155
    const l1Owner = process.env.REACT_APP_L1_OWNER

    const {
        invoke: consume_mint_credit,
        hash,
        submitting
    } = useStarknetInvoke(contract, "consume_mint_credit");

    const transactionStatus = useTransaction(hash);
    console.log(hash)
    if (!account) return null;
    if (!tokensId) return null;
    console.log(account)
    console.log(l2TokenAddress)
    return (
        <Row style={{ padding: '10px', justifyContent: 'center' }}>
            <Button
                type="primary"
                onClick={() => consume_mint_credit && consume_mint_credit({ _l1_token_address: l1TokenAddress, _l2_token_address: l2TokenAddress, _tokens_id: ["0x01", "0x02"], _amounts: ["0x70", "0x40"], _l2_owner: account })}
                style={{ backgroundColor: '#002766', borderColor: '#002766' }}
            >Consume Mint Credit</Button>
        </Row>
    );
}
