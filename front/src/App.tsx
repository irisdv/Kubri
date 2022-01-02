import * as React from 'react'
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { FrontPage } from "./pages/FrontPage";
import { MintPage } from "./pages/MintPage";

import { BlockHashProvider, useBlockHash } from "./providers/BlockHashProvider";
import { StarknetProvider } from "./providers/StarknetProvider";
import { TransactionsProvider, useTransactions } from "./providers/TransactionsProvider";

import { HeaderSite } from "./components/Header";



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
        <StarknetProvider> 
            <BlockHashProvider>
                <TransactionsProvider>
                    <App />
                </TransactionsProvider>
            </BlockHashProvider> 
        </StarknetProvider>
    );
}
export default AppWithProviders;
