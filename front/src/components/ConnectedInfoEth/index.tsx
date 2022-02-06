import React from "react";
import { useEthers } from '@usedapp/core';

export function ConnectedInfoEth() {
    const { account } = useEthers();
    const start = (account as string).substring(0, 6);
    const end = (account as string).substring(38, 42);

    return (
        <div className="">
            <button className="btn btn-secondary text-xs lowercase mx-1">
                {start}...{end}
                <br/>Goerli network
            </button> 
        </div>
    );
}