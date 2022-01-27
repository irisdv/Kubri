import React, { useState, useEffect } from 'react';
import { StoreMetadata } from '../components/StoreMetadata';
import { useBridged1155Contract } from "../lib/bridged1155";


export interface LoginGateProps {
	EthereumSection: React.FC;
	StarknetSection: React.FC;
}

export interface AddressProps {
	address: string;
}

export function MintPage() {

    const bridged1155Contract = useBridged1155Contract();

    return(
        <>
            <div>
                <StoreMetadata contract={bridged1155Contract} />
            </div>
        </>
    );

}