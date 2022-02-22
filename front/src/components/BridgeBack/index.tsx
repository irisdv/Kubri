import React from "react";
import { Contract } from "starknet";
import { useEthereumERC1155Manager } from '../../providers/EthereumERC1155Context';
import { useStarknet } from "../../providers/StarknetProvider";

export function BridgeBack({ contract, tokensID, supply }: { contract?: Contract, tokensID: number[], supply: number[] }) {
    const { account } = useStarknet();
    const { bridgeBack, bridgeBackState } = useEthereumERC1155Manager();
    const [endpointState, setEndpointState] = React.useState(0);

    React.useEffect(() => {
        console.log("STATUS2: ", bridgeBackState.status)
        console.log('transHash: ', bridgeBackState.transaction?.hash)
        if (bridgeBackState.status === 'Success') {
            setEndpointState(2);
        }
    }, [bridgeBackState.status, endpointState])

    const BridgeBackFront = async () => {
        // console.log("ID: ", tokensID)
        console.log("AccountBACK: ", account);
        setEndpointState(1);
        await bridgeBack(tokensID as [], supply as [], account as string);
        console.log("STATUS2: ", bridgeBackState.status)
    }

    return (
        <div>
            <p>You can now bridge back your NFT on L2</p>
            <div className="center-cnt">
                {
                    endpointState === 2 ?
                        <>
                            <p>You just bridge Back your Token on L2</p>
                        </>
                        :
                        <>
                            <button className={endpointState == 0 ? "btn btn-accent my-2" : "btn btn-accent my-2 loading"} onClick={() => BridgeBackFront()}>Bridge Back</button>
                        </>
                }
            </div>
        </div>
    );
}