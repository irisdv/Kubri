import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { StoreMetadata } from '../components/StoreMetadata';

import { useBridged1155Contract } from "../lib/bridged1155";
import { useStarknetCall } from "../lib/hooks";

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