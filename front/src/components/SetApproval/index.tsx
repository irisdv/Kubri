import React from "react";
import { Contract } from "starknet";
import { useStarknetInvoke } from "../../lib/hooks";
import { useStarknet } from "../../providers/StarknetProvider";
import { useTransaction } from "../../providers/TransactionsProvider";
import { useStarknetCall } from "../../lib/hooks";

import { Button, Row } from 'antd';

export function SetApproval({ contract, bridged1155 }: { contract?: Contract, bridged1155?: Contract }) {
    const { account } = useStarknet();
    const [tokensId, setTokensId] = React.useState(["0x01", "0x02"]);
    const tokensId1 = tokensId[0];
    const tokensId2 = tokensId[1];
    let balance1 = useStarknetCall(bridged1155, "balance_of", { account, tokensId1 });
    let balance2 = useStarknetCall(bridged1155, "balance_of", { account, tokensId2 });
    const l1TokenAddress = process.env.REACT_APP_L1_ERC1155
    const l2TokenAddress = process.env.REACT_APP_L2_ERC1155
    const l1Owner = process.env.REACT_APP_L1_OWNER

    const {
        invoke: set_approval_for_all,
        hash,
        submitting
    } = useStarknetInvoke(contract, "set_approval_for_all");
    // const {
    //     invoke: set_approval_for_all,
    //     hash,
    //     submitting
    // } = useStarknetInvoke(contract2, "set_approval_for_all");
    const transactionStatus = useTransaction(hash);
    // console.log(hash)
    // console.log("-------------------BALANCE 1----------------")
    // console.log(useStarknetCall(bridged1155, "balance_of", { account, tokensId1 }))
    if (!account) return null;

    return (
        <div>
            <Row style={{ padding: '10px', justifyContent: 'center' }}>
                <Button
                    type="primary"
                    onClick={() => set_approval_for_all && set_approval_for_all({ l2TokenAddress, approved: 1 })}
                    style={{ backgroundColor: '#002766', borderColor: '#002766' }}
                >Set Approval for all</Button>
                <p>Balance 1 of user connected is currently <b>{balance1?.res}</b></p>
                <p>Balance 2 of user connected is currently <b>{balance2?.res}</b></p>
            </Row>
        </div>
    );
}
