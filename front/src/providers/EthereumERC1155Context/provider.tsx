import React, { useCallback, useEffect, useState } from "react";
import { EthereumERC1155Context } from "./context";
import { useEthereumERC1155Manager } from "./manager";

export interface EthereumERC1155ProviderProps {
    children: React.ReactNode;
}

export function EthereumERC1155Provider({
    children,
}: EthereumERC1155ProviderProps): JSX.Element {
    const state = useEthereumERC1155Manager();
    return (
        <EthereumERC1155Context.Provider value={state}>
            {children}
        </EthereumERC1155Context.Provider>
    );
}