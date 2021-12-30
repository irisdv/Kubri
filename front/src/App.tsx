import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { FrontPage } from "./pages/FrontPage";
// import { MintPage } from "./pages/MintPage";

import { BlockHashProvider, useBlockHash } from "./providers/BlockHashProvider";
import { StarknetProvider } from "./providers/StarknetProvider";
import { TransactionsProvider, useTransactions } from "./providers/TransactionsProvider";

import { HeaderSite } from "./components/Header";



function App() {

    return (
        <>
            <BrowserRouter>
                <HeaderSite />
                <Routes>
                    <Route path="/" element={<FrontPage />} />
                    {/* <Route path="/mint" element={<MintPage />} /> */}
                </Routes>
            </BrowserRouter>
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
