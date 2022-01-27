import React, { useCallback, useEffect, useState } from "react";
import { StarknetERC1155Context } from "./context";
import { useStarknetERC1155Manager } from "./manager";

export interface StarknetERC1155ProviderProps {
  children: React.ReactNode;
}

export function StarknetERC1155Provider({
  children,
}: StarknetERC1155ProviderProps): JSX.Element {
  const state = useStarknetERC1155Manager();
  return (
    <StarknetERC1155Context.Provider value={state}>
      {children}
    </StarknetERC1155Context.Provider>
  );
}


