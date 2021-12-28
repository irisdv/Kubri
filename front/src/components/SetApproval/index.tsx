import React from "react";
import { Contract } from "starknet";
import { useStarknetInvoke } from "../../lib/hooks";
import { useStarknet } from "../../providers/StarknetProvider";
import { useTransaction } from "../../providers/TransactionsProvider";
import { useStarknetCall } from "../../lib/hooks";

import { Button, Row } from 'antd';

export function SetApproval({ contract }: { contract?: Contract }) {

    const { account } = useStarknet();
    const [tokensId, setTokensId] = React.useState(["0x01", "0x02"]);
    const tokensId1 = tokensId[0];
    const tokensId2 = tokensId[1];

    const l1TokenAddress = process.env.REACT_APP_L1_ERC1155
    const l2TokenAddress = process.env.REACT_APP_L2_ERC1155
    const l1Owner = process.env.REACT_APP_L1_OWNER

    const {
        invoke: set_approval_for_all,
        hash,
        submitting
    } = useStarknetInvoke(contract, "set_approval_for_all");

    const transactionStatus = useTransaction(hash);

    if (!account) return null;

    return (
        <div>
            <Row style={{ padding: '10px', justifyContent: 'center' }}>
                <Button
                    type="primary"
                    onClick={() => set_approval_for_all && set_approval_for_all({ l2TokenAddress, approved: 1 })}
                    style={{ backgroundColor: '#002766', borderColor: '#002766' }}
                >Set Approval for all</Button>
            </Row>
        </div>
    );
}
