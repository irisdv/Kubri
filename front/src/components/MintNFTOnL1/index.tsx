import React from "react";
import { Contract } from "starknet";
import { useEthereumERC1155Manager } from '../../providers/EthereumERC1155Context';
import { VoyagerLink } from "../VoyagerLink";

export function MintNFTonL1({ contract, tokensID, supply }: { contract?: Contract, tokensID: number[], supply: number[] }) {
    const { mintFromL2, mintState } = useEthereumERC1155Manager();
    const [endpointState, setEndpointState] = React.useState(0);
    const [mintNFTState, setMintNFTState] = React.useState(0);

    React.useEffect(() => {
        console.log("STATUS1: ", mintState.transaction?.hash)
        if (mintState.status === 'Success') {
            setMintNFTState(2);
        }
    }, [mintState.status, endpointState])


    const MintOnL1 = async () => {
        console.log("TOKENSID: ", tokensID)
        console.log("SUPPLY: ", supply)
        setMintNFTState(1);
        await mintFromL2(tokensID as [], supply as []);
        console.log("STATUS2: ", mintState.status)
    }

    return (
        <div>
            <p>You can now Mint your NFT on L1</p>
            <div className="center-cnt">
                {
                    mintNFTState != 2 ?
                        <button className={mintNFTState == 0 ? "btn btn-accent my-2" : "btn btn-accent my-2 loading"} onClick={() => MintOnL1()}>Mint On L1</button>
                        :
                        <>
                            <p>Your NFT have been mint with Success</p>
                        </>

                }
                {/* <b>Transactions:</b>
                {
                    mintState.transaction && mintState.transaction?.hash ?
                        <VoyagerLink.Transaction transactionHash={mintState.transaction?.hash} />
                        :
                        <> <p>No Transaction found</p>
                        </>
                } */}
                {/* <button className={endpointState == 0 ? "btn btn-accent my-2" : "btn btn-accent my-2 loading"} onClick={() => BridgeOnL1Front()}>Bridge On L1</button> */}
            </div>
        </div>
    );
}