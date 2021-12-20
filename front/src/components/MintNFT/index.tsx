import React from "react";
import { Contract } from "starknet";
import { useStarknetInvoke } from "../../lib/hooks";
import { useStarknet } from "../../providers/StarknetProvider";
import { useTransaction } from "../../providers/TransactionsProvider";

import { Button, Input, Row, Col } from 'antd';

export function InitializeNFT({ contract }: { contract?: Contract }) {
    const { account } = useStarknet();
    const [to, setTo] = React.useState(account);
    const [tokenId, setTokenId] = React.useState("0x01");
    const {
        invoke: initialize_nft,
        hash,
        submitting
    } = useStarknetInvoke(contract, "initialize_nft");
    const transactionStatus = useTransaction(hash);

    // const [amount, setAmount] = React.useState("0x1");

    const updateID = React.useCallback(
        (evt: React.ChangeEvent<HTMLInputElement>) => {
            setTokenId(evt.target.value);
        },
        [setTokenId]
    );

    if (!account) return null;

    return (
        <div>
            <Row style={{ padding: '5px' }}>
                <Col span={12}>
                    <p>Set the ID of NFT you'd like to mint:</p>
                </Col>
                <Col span={12}>
                    <Input onChange={updateID} value={tokenId} placeholder='Token ID to mint' />
                </Col>
            </Row>
            <Row style={{ padding: '10px', justifyContent: 'center' }}>
                <Button
                    type="primary"
                    onClick={() => initialize_nft && initialize_nft({ to, tokenId })}
                    style={{ backgroundColor: '#002766', borderColor: '#002766' }}
                >Mint NFT with ID {tokenId}</Button>
            </Row>
        </div>
    );
}
