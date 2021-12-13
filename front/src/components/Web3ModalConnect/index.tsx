import React, { useState, useEffect } from "react";
import { ethers, providers } from "ethers";
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'

const YOUR_INFURA_KEY = "https://goerli.infura.io/v3/0c06a4ec3a93418b8ba2b4ed03746a18";

export function Web3ModalConnect(props : any) {
  const [web3Modal, setWeb3Modal] = useState(null);
  const [address, setAddress] = useState("");
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    // initiate web3modal
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: YOUR_INFURA_KEY,
        }
      },
    };

    const newWeb3Modal : any = new Web3Modal({
      cacheProvider: true, // very important
      network: "goerli",
      providerOptions,
    });

    setWeb3Modal(newWeb3Modal)

  }, []);

  useEffect(() => {
      // connect automatically and without a popup if user is already connected
      // @ts-ignore
      if(web3Modal && web3Modal.cachedProvider){
        connectWallet()
      }
  }, [web3Modal])

  async function connectWallet() {
    // @ts-ignore
    const provider = await web3Modal.connect();

    addListeners(provider);

    const ethersProvider = new providers.Web3Provider(provider)
    const userAddress = await ethersProvider.getSigner().getAddress()
    setAddress(userAddress)

    const signer : any = await ethersProvider.getSigner()
    setSigner(signer);
  }

  async function addListeners(web3ModalProvider : any) {
    // @ts-ignore
    web3ModalProvider.on("accountsChanged", (accounts) => {
      window.location.reload()
    });
    
    // Subscribe to chainId change
    // @ts-ignore
    web3ModalProvider.on("chainChanged", (chainId) => {
      window.location.reload()
    });
  }

  return (
    <div>
      {signer ?
        <p>User currently signed: {address}</p>
        :
        <div>
          <p>Connect your wallet</p>
          <button onClick={connectWallet}>Connect</button>
        </div>
      }
    </div>
  )
  
}
