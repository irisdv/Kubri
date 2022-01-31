import * as React from 'react'
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { FrontPage } from "./pages/FrontPage";
import { MintPage } from "./pages/MintPage";
import { BlockHashProvider, useBlockHash } from "./providers/BlockHashProvider";
import { StarknetProvider } from "./providers/StarknetProvider";
import { TransactionsProvider, useTransactions } from "./providers/TransactionsProvider";
import { Goerli, Config, DAppProvider } from '@usedapp/core';

import { HeaderSite } from "./components/Header";

const config: Config = {
    readOnlyChainId: Goerli.chainId,
    readOnlyUrls: {
        [Goerli.chainId]: 'https://goerli.infura.io/v3/0c06a4ec3a93418b8ba2b4ed03746a18',
    },
}

function App() {

    return (
        <>
            <Router>
                <HeaderSite />
                <Route exact path="/"> <FrontPage /></Route>
                <Route path="/mint"><MintPage /></Route>
            </Router>
        </>
    );
}

function AppWithProviders() {
    return (
        <DAppProvider config={config}>
            <StarknetProvider>
                <BlockHashProvider>
                    <TransactionsProvider>
                        <App />
                    </TransactionsProvider>
                </BlockHashProvider>
            </StarknetProvider>
        </DAppProvider>
    );
}
export default AppWithProviders;
