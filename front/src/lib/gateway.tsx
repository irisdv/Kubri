import React from "react";
import { Contract, Abi } from "starknet";
import { useStarknet } from "../providers/StarknetProvider";

import GATEWAY from "./abi/gateway1155_abi.json";
import StarknetGateway1155 from './abi/gateway1155.summary.json';

const unOddHex = (v: string) => v.length % 2 === 1 ? `0x0${v.slice(2)}` : v;
const GATEWAY_ADDRESS = unOddHex(StarknetGateway1155.address)

console.log('GATEWAY_ADDRESS', GATEWAY_ADDRESS)

/**
 * Load the counter contract.
 *
 * This example uses a hook because the contract address could depend on the
 * chain or come from an external api.
 * @returns The `counter` contract or undefined.
 */
export function useGatewayContract(): Contract | undefined {
  const { library } = useStarknet();
  const [contract, setContract] = React.useState<Contract | undefined>(
    undefined
  );

  React.useEffect(() => {
    setContract(new Contract(GATEWAY as Abi[], GATEWAY_ADDRESS, library));
  }, [library]);

  return contract;
}
