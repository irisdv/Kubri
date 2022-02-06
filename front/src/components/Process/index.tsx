import React, { useState, useEffect } from "react";

import { Contract } from "starknet";
import { useStarknetInvoke } from "../../lib/hooks";
import { VoyagerLink } from "../VoyagerLink";
import { useStarknet } from "../../providers/StarknetProvider";
import { useTransaction, useTransactions } from "../../providers/TransactionsProvider";
import { useStarknetERC1155Manager } from '../../providers/StarknetERC1155Context';

import { useEthereumERC1155Manager } from '../../providers/EthereumERC1155Context';
import { EtherscanLink } from "../EtherscanLink";

import { ConnectedOnly } from "../ConnectedOnly";
import { SetApproval } from "../SetApproval";
import { ListOwnedTokens } from "../ListOwnedTokens";
import { ConnectedWallet } from "../ConnectedWallet";
import { BridgeNFTonL1 } from "../BridgeOnL1";
import { MintNFTonL1 } from "../MintNFTOnL1";


export function Process({ contract }: { contract?: Contract }) {
    const { account } = useStarknet();
    const { address, balanceOf1, balanceOf2, approvedGateway, bridgeToL1 } = useStarknetERC1155Manager();
    const { txHash, l1_address, l1_token_address } = useEthereumERC1155Manager();
    const { addTransaction } = useTransactions();
    const { transactions } = useTransactions();

    const [step, setStep] = useState(0);

    const [minting, setMinting] = useState(0);
    const supply = [5,10];
    const tokensID = [1,2];
    const {
        invoke: initialize_nft_batch,
        hash,
        submitting
    } = useStarknetInvoke(contract, "initialize_nft_batch");
    const transactionStatus = useTransaction(hash);

    const [bridgeState, setBridgeState] = useState(0);

    // -------------------------   Mint NFT ------------------------------

    const MintNFT = async () => {
        if (account && initialize_nft_batch) { 
            setMinting(1);
            initialize_nft_batch({ account, tokensID, supply });
            // console.log('transactionStatus', transactionStatus);
        }
    }
    React.useEffect(() => {
        if (minting==1 && !submitting) {
          if (transactionStatus) console.log('Minting transaction status', transactionStatus.code);
          if (transactionStatus && (transactionStatus.code == 'REJECTED')) {
            setMinting(2);
          } else if (submitting == false && transactionStatus && (transactionStatus.code == 'ACCEPTED_ON_L1' || transactionStatus.code == 'ACCEPTED_ON_L2')) {
            setMinting(0);
            setStep(1);
          }
        }
      }, [minting, submitting, transactionStatus])


    // -------------------------  Bridge NFT to L1 ------------------------------

    const bridgeBatchFront = async () => {
        setBridgeState(1);
        const tx = await bridgeToL1(tokensID as [], supply as [], l1_address as string);
       // @ts-ignore
        if (tx && tx.transaction_hash) {
            // @ts-ignore
            addTransaction(tx);
        }
    }


    // Helper functions
    const range = (start: number, stop: number, step: number) => {
        var a = [start], b = start;
        while (b < stop) {
            a.push(b += step || 1);
        }
        return a;
    }

    const selectNextHandler = () => {
        console.log(step);
        switch (step < 4) {
            case step == 0:
                setStep((prevActiveStep) => prevActiveStep + 1);
                break
            case step == 1:
                setStep((prevActiveStep) => prevActiveStep + 1);
                break
            case step == 2:
                setStep((prevActiveStep) => prevActiveStep + 1);
                break
        }
    };

    const selectPrevHandler = () => {
        if (step > 0) {
            setStep((prevActiveStep) => prevActiveStep - 1);
            console.log('next');
        } else {
            console.log('no');
        }
    };

    return(
        <>
            <div className="alert alert-info background-neutral">
                <div className="flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <label className="text-primary">You can mint NFT already Bridge on L1<a className="color-accent underline" onClick={() => setStep(3)}> Mint NFT</a></label>
                </div>
            </div>

            <div className="p-5">
                <ul className="w-full steps">
                    <li data-content={step == 0 ? "1" : "✓"} className={step == 0 ? "step" : "step step-accent"}>Create collectibles on Starknet</li>
                    <li data-content={step < 2 ? "2" : "✓"} className={step < 1 ? "step" : "step step-accent"}>Bridge to L1</li>
                    <li data-content={step < 3 ? "3" : "✓"} className={step < 2 ? "step" : "step step-accent"}>Get your NFTs on L1</li>
                    <li data-content={step < 4 ? "4" : "✓"} className={step < 3 ? "step" : "step step-accent"}>Mint NFT on L1</li>
                </ul>
            </div>

            {step == 0 && 
                <>
                    <div className="grid grid-cols-1">
                        <p className="text-center mt-2">To test the bridge mint some test tokens on Starknet</p><br/>
                        <div className="center-cnt">
                            <ConnectedOnly> 
                                <button
                                    className={minting == 0 ? "btn btn-primary my-2 mx-2" : "btn btn-primary my-2 mx-2 loading"}
                                    onClick={() => MintNFT()}
                                >Mint a batch of NFTs to test</button>
                                {minting==1 && transactionStatus ? <p>Transaction status: {transactionStatus.code} </p> : ''}

                                <button className="btn btn-primary mx-2" onClick={() => setStep(1)}>Bridge your existing NFTs to L1</button>
                            </ConnectedOnly>
                        </div>
                        <div className="center-cnt">
                            <button className="btn btn-secondary mx-2 my-2" onClick={() => setStep(3)}>Mint NFTs already bridged on L1</button>
                        </div>
                    </div>
                </> 
            }
            {step == 1 && 
                <>
                    <div className="grid grid-cols-2 gap-3 px-10">
                        <div className="card rounded-lg shadow-2xl px-10 py-5 mb-3">
                            {parseInt(balanceOf1) != 0 || parseInt(balanceOf2) != 0 ? 
                                <>
                                    <ListOwnedTokens address={address} balanceOf1={balanceOf1} balanceOf2={balanceOf2} />
                                </>
                            : 
                            ''}
                        </div>
                        <div className="card rounded-lg shadow-2xl px-10 py-5 mb-3">

                            {!approvedGateway ?
                                    <ConnectedOnly>
                                        <SetApproval />
                                    </ConnectedOnly>
                                    :
                                    <>
                                        <p>You can now bridge your NFTs to L1</p>
                                        <button className={bridgeState == 0 ? "btn btn-accent mr-2" : "btn btn-accent mr-2 loading"} onClick={() => bridgeBatchFront()}>Bridge to L1</button>
                                    </>

                            }
                            <ul className="mt-4">
                                <li><b>Starknet ERC1155 contract:</b> <VoyagerLink.Contract contract={address} /></li>
                                <li><b>Starknet Gateway contrac:</b> <VoyagerLink.Contract contract={address} /></li>
                                <li><b>Ethereum ERC1155 contract:</b> <EtherscanLink.Contract contract={l1_token_address} /></li>
                                <li><b>Ethereum Gateway contract:</b> <EtherscanLink.Contract contract={l1_address} /></li>
                                {transactions.length > 0 ?
                                    <li><b>Transactions:</b>
                                        <ul>
                                            {transactions.map((tx, idx) => (
                                                <li key={idx}>
                                                    <VoyagerLink.Transaction transactionHash={tx.hash} />
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                    : ''
                                }
                            </ul>

                        </div>

                    </div>
                </>
            }
            {step == 2 && 
                <>
                    <div className="grid grid-cols-2 gap-3 px-10">
                        <div className="card rounded-lg shadow-2xl px-10 py-5 mb-3">
                            {parseInt(balanceOf1) != 0 || parseInt(balanceOf2) != 0 ? 
                                <>
                                    <ListOwnedTokens address={address} balanceOf1={balanceOf1} balanceOf2={balanceOf2} />
                                </>
                            : 
                            ''}
                        </div>
                        <div className="card rounded-lg shadow-2xl px-10 py-5 mb-3">
                            {
                                <ConnectedWallet>
                                    <BridgeNFTonL1 tokensID={[1, 2]} supply={[5, 10]} />
                                </ConnectedWallet>
                            }
                            <ul className="mt-4">
                                <li><b>Ethereum ERC1155 contract:</b> <EtherscanLink.Contract contract={l1_token_address} /></li>
                                <li><b>Ethereum Gateway contract:</b> <EtherscanLink.Contract contract={l1_address} /></li>
                                <li><b>Ethereum Transaction:</b> <EtherscanLink.Transaction transactionHash={txHash} /></li>
                            </ul>

                        </div>

                    </div>
                
                </>
            
            }
             {step == 3 &&
                <>
                    <div className="card rounded-lg shadow-2xl px-10 py-5 mb-3">
                            <ConnectedWallet>
                                <MintNFTonL1 tokensID={[1, 2]} supply={[5, 10]} />
                            </ConnectedWallet>
                        <ul className="mt-4">
                            <li><b>Ethereum ERC1155 contract:</b> <EtherscanLink.Contract contract={l1_token_address} /></li>
                            <li><b>Ethereum Gateway contract:</b> <EtherscanLink.Contract contract={l1_address} /></li>
                            <li><b>Ethereum Transaction:</b> <EtherscanLink.Transaction transactionHash={txHash} /></li>
                        </ul>

                    </div>

                </>
            } 
        </>
    );


}