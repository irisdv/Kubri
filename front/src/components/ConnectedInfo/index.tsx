import React from "react";
import { useStarknet } from "../../providers/StarknetProvider";

export function ConnectedInfo() {
    const { account, enable } = useStarknet();
    const start = (account as string).substring(0, 6);
    const end = (account as string).substring(61, 65);

    return (
        <div className="">
            <button className="btn btn-secondary text-xs lowercase">
                {start}...{end}
                <br/>Starknet testnet
                {/* <div className="badge text-2xs ml-2 badge-outline">Starknet Testnet</div> */}
            </button> 
        </div>
    );
}