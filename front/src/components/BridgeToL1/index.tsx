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
    // const {
    //     invoke: set_approval_for_all,
    //     hash,
    //     submitting
    // } = useStarknetInvoke(contract2, "set_approval_for_all");
    const transactionStatus = useTransaction(hash);
    console.log(hash)
    if (!account) return null;
    if (!tokensId) return null;

    return (
        <Row style={{ padding: '10px', justifyContent: 'center' }}>
            {/* <Button
                type="primary"
                onClick={() => set_approval_for_all && set_approval_for_all({})}
                style={{ backgroundColor: '#002766', borderColor: '#002766' }}
            >Bridge NFT to L1</Button> */}
            <Button
                type="primary"
                onClick={() => bridge_to_mainnet && bridge_to_mainnet({ l1TokenAddress, l2TokenAddress, tokensIdLen, tokensId, amountsLen, amounts, l1Owner })}
                style={{ backgroundColor: '#002766', borderColor: '#002766' }}
            >Bridge NFT to L1</Button>
        </Row>
    );
}
