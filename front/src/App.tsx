import React from "react";
import "./App.css";
import 'antd/dist/antd.css';
import { Space, Card, Row, Col, Layout } from 'antd';

import { useGatewayContract } from "./lib/gateway";
import { useBridged1155Contract } from "./lib/bridged1155";

import { useStarknetCall } from "./lib/hooks";
import {
    BlockHashProvider,
    useBlockHash,
} from "./providers/BlockHashProvider";
import { StarknetProvider } from "./providers/StarknetProvider";
import { TransactionsProvider, useTransactions } from "./providers/TransactionsProvider";
import { useStarknet } from "./providers/StarknetProvider";
import { ConnectedOnly } from "./components/ConnectedOnly";
import { VoyagerLink } from "./components/VoyagerLink";

import { MintingBlob } from "./components/MintingBlob";

// import { InitializeNFT } from "./components/MintNFT";
import { BridgeToL1 } from "./components/BridgeToL1";

import { Web3ModalConnect } from "./components/Web3ModalConnect";
import { WithdrawAndMint } from "./components/WithdrawAndMint";


// const { Header, Content, Footer, Sider } = Layout;


function App() {
    const blockNumber = useBlockHash();
    const bridged1155Contract = useBridged1155Contract();
    const gatewayContract = useGatewayContract();
    const { account } = useStarknet();
    const [tokensId, setTokensId] = React.useState(["0x01", "0x02"]);
    const tokensId1 = tokensId[0];
    const tokensId2 = tokensId[1];
    const balance1 = useStarknetCall(bridged1155Contract, "balance_of", { account, tokensId1 });
    const balance2 = useStarknetCall(bridged1155Contract, "balance_of", { account, tokensId2 });
    const [amounts, setAmounts] = React.useState([balance1, balance2]);
    const { transactions } = useTransactions();

    return (
        <div className="container">

            <Layout style={{ padding: '30px' }}>

                <Row gutter={16}>

                    <Col span={12} style={{ display: 'flex' }}>
                        <Card title="Starknet data" headStyle={{ backgroundColor: '#002766', color: '#FFFFFF' }}>
                            <ul>
                                <li><b>Current Block:</b>{" "}
                                    {blockNumber && <VoyagerLink.Block block={blockNumber} />}
                                </li>
                                <li><b>Starknet ERC1155 contract:</b>{" "}
                                    {bridged1155Contract?.connectedTo && (
                                        <VoyagerLink.Contract contract={bridged1155Contract?.connectedTo} />
                                    )}
                                </li>
                                <li><b>Starknet Gateway contract:</b>{" "}
                                    {gatewayContract?.connectedTo && (
                                        <VoyagerLink.Contract contract={gatewayContract?.connectedTo} />
                                    )}
                                </li>
                                <li><b>Transactions:</b>
                                    <ul>
                                        {transactions.map((tx, idx) => (
                                            <li key={idx}>
                                                <VoyagerLink.Transaction transactionHash={tx.hash} />
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Mint ERC1155 NFT on Starknet" headStyle={{ backgroundColor: '#002766', color: '#FFFFFF' }}>
                            <ConnectedOnly>
                                <p>Balance 1 of user connected is currently <b>{balance1?.res}</b></p>
                                <p>Balance 2 of user connected is currently <b>{balance2?.res}</b></p>
                                {/* <InitializeNFT contract={bridged1155Contract} /> */}

                                <BridgeToL1 contract={gatewayContract} tokensIdLen={tokensId.length} tokensId={tokensId} amountsLen={amounts.length} amounts={amounts} />

                            </ConnectedOnly>
                        </Card>

                    </Col>
                </Row>

            </Layout>

            <Layout style={{ padding: '30px' }}>
                <Row gutter={16}>

                    <Col span={12} style={{ display: 'flex' }}>
                        <Card title="Solidity data">
                            <p></p>
                        </Card>
                    </Col>

                    <Col span={12}>
                        <Card title="Interact with solidity contracts on Goerli network">
                            <Web3ModalConnect />
                            <WithdrawAndMint />
                            <MintingBlob />
                        </Card>
                    </Col>

                </Row>
            </Layout>
        </div>
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
