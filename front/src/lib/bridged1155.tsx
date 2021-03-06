import React from "react";
import { Contract, Abi } from "starknet";
import { useStarknet } from "../providers/StarknetProvider";

import BRIDGED1155 from "./abi/bridged1155_abi.json";
import StarknetBridged1155 from './abi/bridged1155.summary.json';

const unOddHex = (v: string) => v.length % 2 === 1 ? `0x0${v.slice(2)}` : v;
const ERC1155_ADDRESS = unOddHex(StarknetBridged1155.address)

console.log('ERC1155_ADDRESS', ERC1155_ADDRESS)

/**
 * Load the counter contract.
 *
 * This example uses a hook because the contract address could depend on the
 * chain or come from an external api.
 * @returns The `counter` contract or undefined.
 */
export function useBridged1155Contract(): Contract | undefined {
    const { library } = useStarknet();
    const [contract, setContract] = React.useState<Contract | undefined>(
        undefined
    );

    React.useEffect(() => {
        setContract(new Contract(BRIDGED1155 as Abi[], ERC1155_ADDRESS, library));
    }, [library]);

    return contract;
}