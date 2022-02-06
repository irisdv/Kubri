import React from "react";
import { NavLink } from 'react-router-dom';
import { ConnectedOnly } from '../ConnectedOnly'
import { ConnectedInfo } from '../ConnectedInfo';
import { ConnectedWallet } from '../ConnectedWallet';
import { ConnectedInfoEth } from '../ConnectedInfoEth';
export function HeaderSite() {

    return (
        <>
            <div className="navbar mb-2 shadow-lg bg-primary text-neutral-content">
                <div className="px-2 mx-2 navbar-start">
                    <span className="text-3xl font-bold">
                        KUBRI
                    </span>
                </div>
                <div className="hidden px-2 mx-2 navbar-center lg:flex">
                    <div className="flex items-stretch">
                        <p className="text-xl">Mint & bridge ERC1155 NFTs from Starknet to Ethereum</p>
                        {/* <nav>
                            <NavLink to='/' className="btn btn-ghost btn-sm rounded-btn nav-link text-lg" activeClassName="active">Home</NavLink>
                        </nav> */}
                    </div>
                </div>
                <div className="navbar-end">
                    <ConnectedOnly>
                        <ConnectedInfo />
                    </ConnectedOnly>
                    <ConnectedWallet>
                        <ConnectedInfoEth />
                    </ConnectedWallet>
                </div>
            </div>
        </>
    );


}