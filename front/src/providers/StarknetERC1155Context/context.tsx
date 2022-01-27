import React from "react";

import { StarknetERC1155State, STARKNET_ERC1155_INITIAL_STATE } from "./model";

export const StarknetERC1155Context = React.createContext<StarknetERC1155State>(
    STARKNET_ERC1155_INITIAL_STATE
);

export function useStarknetERC1155() {
  return React.useContext(StarknetERC1155Context);
}