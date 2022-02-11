import { convertLegacyProps } from "antd/lib/button/button";
import React from "react";
import { Contract } from "starknet";
import { useStarknetERC1155Manager } from '../../providers/StarknetERC1155Context';
import { useTransactions } from "../../providers/TransactionsProvider";

export function SetApproval({ contract }: { contract?: Contract }) {
    const { addTransaction } = useTransactions();
    const { transactions } = useTransactions();
    const { address, approveUser, approvalTx, approvedGateway } = useStarknetERC1155Manager();
    const [approvalState, setApprovalState] = React.useState(0);

    React.useEffect(() => {
        if (approvalState == 0 && approvedGateway == true) {
            setApprovalState(2);
        }
        if (approvalState == 1) {
            console.log('approval ongoing');
            var data = transactions.filter((transactions) => (transactions.hash) === approvalTx);
            console.log('data', data);
            if (data && data[0] && data[0].code && (data[0].code == 'REJECTED')) {
                setApprovalState(0)
            } else if (data && data[0] && (data[0].code == 'ACCEPTED_ON_L1' || data[0].code == 'ACCEPTED_ON_L2')) {
                console.log('tx pour set approval est bien passée on peut passer au bridge')
                setApprovalState(2);
            }
        }
    }, [approvalState, transactions, approvalTx, approvedGateway])

    const approveUserFront = async () => {
        setApprovalState(1);
        const tx = await approveUser(address as string);
        // @ts-ignore
        if (tx && tx.transaction_hash) {
            // @ts-ignore
            addTransaction(tx);
        }
    }

    return (
        <div>
            <p>To bridge your NFTs to L1 first you need to set approval for the gateway contract to transfer your NFTs</p>
            <div className="center-cnt">
                <button className={approvalState == 0 ? "btn btn-accent my-2" : "btn btn-accent my-2 loading"} onClick={() => approveUserFront()}>Set Approval</button>
            </div>
        </div>
    );
}
