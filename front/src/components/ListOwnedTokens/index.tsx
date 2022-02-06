import React, { useEffect, useState } from "react";
import axios from "axios";
import { useStarknet } from "../../providers/StarknetProvider";
import { number, stark, shortString } from 'starknet';
const { hexToDecimalString } = number;
const { getSelectorFromName } = stark;
const { decodeShortString } = shortString;

export function ListOwnedTokens({ address, balanceOf1, balanceOf2 }: { address?: string, balanceOf1?: string, balanceOf2: string }) {

    const starknet = useStarknet();
    const [uri1, setUri1] = useState('');
    const [uri2, setUri2] = useState('');

    useEffect(() => {

        // const test = useTokenURI('ipfs://bafkreierzdc5kkrbxmkooj2wt2jx4pebvne5nko4qzowpurj5hr7l4kv7u');
        // console.log('test', test);

        if (balanceOf1 && parseInt(balanceOf1) > 0) {
            setTimeout(async () => {
                let _token_uri;
                try {
                    _token_uri = await starknet.starknet.provider.callContract({
                        contract_address: address,
                        entry_point_selector: getSelectorFromName('uri'),
                        calldata: ['1']
                    })
                    console.log('token uri', _token_uri);
                } catch (e) {
                    console.log('error with uri', e)
                }
                if (_token_uri && _token_uri.result) {
                    const first = decodeShortString(_token_uri.result[0]);
                    const last = decodeShortString(_token_uri.result[1])
                    const all = first+last;
                    console.log('all', all);
                    // const tokenUriData = await axios.get("https://ipfs.infura.io/ipfs/bafkreierzdc5kkrbxmkooj2wt2jx4pebvne5nko4qzowpurj5hr7l4kv7u", { responseType: 'blob' })
                    const tokenUriData = await axios.get("https://ipfs.infura.io/ipfs/bafkreierzdc5kkrbxmkooj2wt2jx4pebvne5nko4qzowpurj5hr7l4kv7u")
                    console.log('tokenUriData', tokenUriData.data);
                    // console.log('tokenUriData', tokenUriData.data.image);
                    // console.log('tokenUriData', tokenUriData.data.image_url);
                    // ipfs://bafkreierzdc5kkrbxmkooj2wt2jx4pebvne5nko4qzowpurj5hr7l4kv7u
                    // setUriA(tokenUriData.data.image_url);
                }
            }, 0);
        }
    }, [balanceOf1, balanceOf2])

    return (
        <div>
            <p>Your NFTs on Starknet</p>
            {balanceOf1 && parseInt(balanceOf1)>0 &&
                <>
                    <div>
                        <img src="https://ipfs.infura.io/ipfs/bafkreierzdc5kkrbxmkooj2wt2jx4pebvne5nko4qzowpurj5hr7l4kv7u"></img>
                        <p>supply: {balanceOf1}</p>
                    </div>
                </>
            }
            {balanceOf2 && parseInt(balanceOf2)>0 &&
                <>
                    <div>
                        <img src="https://ipfs.infura.io/ipfs/bafkreierzdc5kkrbxmkooj2wt2jx4pebvne5nko4qzowpurj5hr7l4kv7u"></img>
                        <p>supply: {balanceOf2}</p>
                    </div>
                </>
            }
        </div>
    );
}
