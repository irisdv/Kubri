import { env } from "process";
import React from "react";
import { Contract, Abi } from "starknet";
import { useStarknet } from "../providers/StarknetProvider";

import BRIDGED721 from "./abi/bridged721.json";

const ERC721_ADDRESS =
  "0x0184b283baedf52cc72d46621d92b465087a208fa4ebff2178f5c8b2fb7765f4";

/**
 * Load the counter contract.
 *
 * This example uses a hook because the contract address could depend on the
 * chain or come from an external api.
 * @returns The `counter` contract or undefined.
 */
export function useBridged721Contract(): Contract | undefined {
  const { library } = useStarknet();
  const [contract, setContract] = React.useState<Contract | undefined>(
    undefined
  );

  React.useEffect(() => {
    setContract(new Contract(BRIDGED721 as Abi[], ERC721_ADDRESS, library));
  }, [library]);

  return contract;
}
