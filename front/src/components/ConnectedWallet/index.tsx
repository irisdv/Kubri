import React from "react";
import { useState, useEffect } from "react";
import { ethers, providers } from "ethers";
import { Goerli, Config, useBlockNumber, useEthers } from '@usedapp/core';
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

export function ConnectedWallet(props: any) {
    const { activateBrowserWallet, account, deactivate } = useEthers()
    // const [web3Modal, setWeb3Modal] = useState(null);
    const [address, setAddress] = useState("");
    const [signer, setSigner] = useState(null);
    return (
        <div>
            <div style={{ padding: '10px', justifyContent: 'center' }}>
                {!account && <button
                    className="btn btn-primary"
                    onClick={() => activateBrowserWallet()}
                >Connect MetaMask Wallet</button>}
                {account && <button
                    className="btn btn-primary"
                    onClick={() => deactivate()}
                >Deactivate MetaMask Wallet</button>}
            </div>
            {account && <p>Account: {account}</p>}
        </div>
    )

}
