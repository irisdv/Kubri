import React, { useEffect, useState } from "react";
import axios from "axios";
import { useStarknet } from "../../providers/StarknetProvider";
import { useStarknetERC1155Manager } from '../../providers/StarknetERC1155Context';
import { number, stark, shortString } from 'starknet';
const { hexToDecimalString } = number;
const { getSelectorFromName } = stark;
const { decodeShortString } = shortString;

export function ListOwnedTokens({ address }: { address?: string }) {

    const starknet = useStarknet();
    const { balanceOf1, balanceOf2 } = useStarknetERC1155Manager();
    const [uri1, setUri1] = useState('');
    const [uri2, setUri2] = useState('');
    const [metadata1, setMetadata1] = useState(null as any);
    const [metadata2, setMetadata2] = useState(null as any);
    const [image1, setImage1] = useState('');
    const [image2, setImage2] = useState('');

    useEffect(() => {
        if (balanceOf1 && parseInt(balanceOf1) > 0) {
            setTimeout(async () => {
                let _token_uri;
                try {
                    _token_uri = await starknet.starknet.provider.callContract({
                        contract_address: address,
                        entry_point_selector: getSelectorFromName('uri'),
                        calldata: ['1']
                    })
                    // console.log('token uri', _token_uri);
                } catch (e) {
                    console.log('error while fetching uri', e)
                }
                if (_token_uri && _token_uri.result) {
                    const first = decodeShortString(_token_uri.result[0]);
                    const last = decodeShortString(_token_uri.result[1])
                    const all = first + last;
                    const metadata = await axios.get("https://ipfs.io/ipfs/"+all+"/1.json");
                    setMetadata1(metadata.data);
                }
            }, 0);
        }
    }, [balanceOf1])

    useEffect(() => {
        if (balanceOf2 && parseInt(balanceOf2) > 0) {
            setTimeout(async () => {
                let _token_uri;
                try {
                    _token_uri = await starknet.starknet.provider.callContract({
                        contract_address: address,
                        entry_point_selector: getSelectorFromName('uri'),
                        calldata: ['1']
                    })
                    // console.log('token uri', _token_uri);
                } catch (e) {
                    console.log('error while fetching uri', e)
                }
                if (_token_uri && _token_uri.result) {
                    const first = decodeShortString(_token_uri.result[0]);
                    const last = decodeShortString(_token_uri.result[1])
                    const all = first + last;
                    const metadata = await axios.get("https://ipfs.io/ipfs/"+all+"/2.json");
                    setMetadata2(metadata.data);
                }
            }, 0);
        }
    }, [balanceOf2])

    useEffect(() => {
        // console.log('metadata1', metadata1)
        if (metadata1) {
            let url;
            if (metadata1.image) {
                url = metadata1.image
                setImage1(`https://ipfs.io/${url.slice('ipfs://'.length)}`)
            }
        }
    }, [metadata1]);

    useEffect(() => {
        // console.log('metadata2', metadata2)
        if (metadata2) {
            let url;
            if (metadata2.image) {
                url = metadata2.image
                setImage2(`https://ipfs.io/${url.slice('ipfs://'.length)}`)
            }
        }
    }, [metadata2]);


    return (
        <>
        { parseInt(balanceOf1) != 0 || parseInt(balanceOf2) != 0 ?
            <div>
                <p>Your NFTs on Starknet</p>
                {balanceOf1 && parseInt(balanceOf1) > 0 &&
                    <>
                        <div>
                            <img src={image1}></img>
                            <p>supply: {balanceOf1}</p>
                        </div>
                    </>
                }
                {balanceOf2 && parseInt(balanceOf2) > 0 &&
                    <>
                        <div>
                            <img src={image2}></img>
                            <p>supply: {balanceOf2}</p>
                        </div>
                    </>
                }
            </div>
        : 'You don\'t own any tokens.' }
        </>
    );
}
