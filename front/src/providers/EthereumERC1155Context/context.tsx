import React from "react";

import { EthereumERC1155State, ETHEREUM_ERC1155_INITIAL_STATE } from "./model";

export const EthereumERC1155Context = React.createContext<EthereumERC1155State>(
    ETHEREUM_ERC1155_INITIAL_STATE
);

export function useEthereumERC1155() {
    return React.useContext(EthereumERC1155Context);
}