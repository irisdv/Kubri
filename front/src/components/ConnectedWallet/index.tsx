import React from "react";
import { useState, useEffect } from "react";
import { ethers, providers } from "ethers";
import { ChainId, useEthers } from '@usedapp/core';
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

interface ConnectedWalletProps {
    children: React.ReactNode;
}

export function ConnectedWallet({ children }: ConnectedWalletProps): JSX.Element {
    const { activateBrowserWallet, account, deactivate, chainId } = useEthers()
    // const [web3Modal, setWeb3Modal] = useState(null);
    const [address, setAddress] = useState("");
    if (!account) {
        return (
            <div>
                <div style={{ padding: '10px', justifyContent: 'center' }}>
                    {!account && <button
                        className="btn btn-accent"
                        onClick={() => activateBrowserWallet()}
                    >Connect MetaMask Wallet</button>}
                </div>
                {account && <p>Account: {account}</p>}
            </div>
        )
    }
    if (account && chainId != ChainId.Goerli) {
        return (
            <div>
                <div style={{ padding: '10px', justifyContent: 'center' }}>
                    {account && <button
                        className="btn btn-success"
                        onClick={() => deactivate()}
                    >Deactivate MetaMask Wallet</button>}
                </div>
                <div style={{ color: 'red' }}>
                    {account && <p>WARNING: YOU ARE NOT CONNECTED TO GOERLI</p>}
                </div>
            </div>
        )
    }
    return <React.Fragment>{children}</React.Fragment>;

}
