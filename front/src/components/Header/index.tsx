import React from "react";
import { NavLink } from 'react-router-dom';
import { ConnectedOnly } from '../ConnectedOnly'
import { ConnectedInfo } from '../ConnectedInfo';
import { ConnectedWallet } from '../ConnectedWallet';
export function HeaderSite() {

    return (
        <>
            <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box">
                <div className="px-2 mx-2 navbar-start">
                    <span className="text-lg font-bold">
                        Mekhenty
                    </span>
                </div>
                <div className="hidden px-2 mx-2 navbar-center lg:flex">
                    <div className="flex items-stretch">
                        <nav>
                            <NavLink to='/' className="btn btn-ghost btn-sm rounded-btn nav-link" activeClassName="active">Home</NavLink>
                        </nav>

                        <nav>
                            <NavLink to='/mint' className="btn btn-ghost btn-sm rounded-btn nav-link" activeClassName="active">Mint ERC1155 NFT</NavLink>
                        </nav>
                    </div>
                </div>
                {/* <div className="navbar-end">
                    <ConnectedOnly>
                        <ConnectedInfo />
                    </ConnectedOnly>
                </div> */}
                <div className="navbar-end">
                    <ConnectedWallet>
                        <ConnectedInfo />
                    </ConnectedWallet>
                </div>
            </div>
        </>
    );


}