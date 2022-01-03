import React from "react";
import { Contract } from "starknet";
import { useStarknetInvoke } from "../../lib/hooks";
import { useStarknet } from "../../providers/StarknetProvider";
import { useTransaction } from "../../providers/TransactionsProvider";

import { Button, Row } from 'antd';

export function BridgeToL1({ contract, tokensIdLen, tokensId, amountsLen, amounts }: { contract?: Contract, tokensIdLen?: any, tokensId?: any, amountsLen?: any, amounts: any }) {
    const { account } = useStarknet();

    const l1TokenAddress = process.env.REACT_APP_L1_ERC1155
    const l2TokenAddress = process.env.REACT_APP_L2_ERC1155
    const l1Owner = process.env.REACT_APP_L1_OWNER

    const {
        invoke: bridge_to_mainnet,
        hash,
        submitting
    } = useStarknetInvoke(contract, "bridge_to_mainnet");

    const transactionStatus = useTransaction(hash);
    console.log(hash)
    if (!account) return null;
    if (!tokensId) return null;
    console.log(l1TokenAddress)
    console.log(l2TokenAddress)
    return (
        <Row style={{ padding: '10px', justifyContent: 'center' }}>
            <Button
                type="primary"
                onClick={() => bridge_to_mainnet && bridge_to_mainnet({ _l1_token_address: l1TokenAddress, _l2_token_address: l2TokenAddress, _tokens_id: ["0x01", "0x02"], _amounts: ["0x03", "0x02"], l1Owner })}
                style={{ backgroundColor: '#002766', borderColor: '#002766' }}
            >Bridge NFT to L1</Button>
        </Row>
    );
}
