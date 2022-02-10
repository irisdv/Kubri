import React from "react";
import { Contract } from "starknet";
import { useEthereumERC1155Manager } from '../../providers/EthereumERC1155Context';
import { MintNFTonL1 } from "../MintNFTOnL1";
import { VoyagerLink } from "../VoyagerLink";

export function BridgeNFTonL1({ contract, tokensID, supply }: { contract?: Contract, tokensID: number[], supply: number[] }) {
    const { bridgeFromL2, bridgeState, txHash } = useEthereumERC1155Manager();
    const [endpointState, setEndpointState] = React.useState(0);

    React.useEffect(() => {
        console.log("STATUS2: ", bridgeState.status)
        console.log('transHash: ', bridgeState.transaction?.hash)
        if (bridgeState.status === 'Success') {
            setEndpointState(2);
        }
    }, [bridgeState.status, endpointState])

    const BridgeOnL1Front = async () => {
        // console.log("ID: ", tokensID)
        // console.log("Amounts: ", supply)
        setEndpointState(1);
        await bridgeFromL2(tokensID as [], supply as []);
        console.log("STATUS2: ", bridgeState.status)
    }

    return (
        <div>
            <p>You can now bridge your NFT on L1 and mint them later if you want</p>
            <div className="center-cnt">
                {
                    endpointState === 2 ?
                        <MintNFTonL1 tokensID={[1, 2]} supply={[5, 10]} />
                        :
                        <>
                            <button className={endpointState == 0 ? "btn btn-accent my-2" : "btn btn-accent my-2 loading"} onClick={() => BridgeOnL1Front()}>Bridge On L1</button>
                            {/* <b>Transactions:</b>
                            {
                                bridgeState.transaction && bridgeState.transaction?.hash ?
                                    <VoyagerLink.Transaction transactionHash={bridgeState.transaction?.hash} />
                                    :
                                    <> <p>No Transaction found</p>
                                    </>
                            } */}
                        </>
                }
                {/* <button className={endpointState == 0 ? "btn btn-accent my-2" : "btn btn-accent my-2 loading"} onClick={() => BridgeOnL1Front()}>Bridge On L1</button> */}
            </div>
        </div>
    );
}