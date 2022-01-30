import React from "react";
import axios from "axios";
import { Contract } from "starknet";
import { useStarknetInvoke } from "../../lib/hooks";
import { useStarknet } from "../../providers/StarknetProvider";
import { useStarknetCall } from "../../lib/hooks";

import { useStarknetERC1155Manager } from '../../providers/StarknetERC1155Context';
import { useTransaction, useTransactions } from "../../providers/TransactionsProvider";
import { useBridged1155Contract } from "../../lib/bridged1155";

import { useTokenURI } from '../../hooks/useTokenURI';

import { number, stark, shortString } from 'starknet';
const { hexToDecimalString } = number;
const { getSelectorFromName } = stark;
const { decodeShortString } = shortString;

export function ListOwnedTokens({ contract }: { contract?: Contract }) {

    const starknet = useStarknet();
    const { address, ownedTokens } = useStarknetERC1155Manager();
    // const bridged1155Contract = useBridged1155Contract();

    // const finalURI : [] = [];
    const finalURI = [{}];

    React.useEffect(() => {

        if (ownedTokens.length > 0) {
            ownedTokens.map((item) => {
                console.log('item', item);
                const token_id = parseInt(hexToDecimalString(item));
                console.log('token_id', token_id);
                // const _token = useStarknetCall(bridged1155Contract, "uri", { item });

                // récupérer le token uri
                // setTimeout(async () => {
                //     let _token_uri;
                //     try {
                //         _token_uri = await starknet.starknet.provider.callContract({
                //             contract_address: address,
                //             entry_point_selector: getSelectorFromName('uri'),
                //             calldata: [hexToDecimalString(item)]
                //         })
                //     } catch (e) {
                //         console.log('error with uri', e)
                //     }
                //     if (_token_uri && _token_uri.result) {
                //         console.log('_token_uri', _token_uri)
                //         const first = decodeShortString(_token_uri.result[0])
                //         const last = decodeShortString(_token_uri.result[1])
                //         const all = 'bafybeihyw2galiaendxqpn3fnpeyvrgknpv7haekaxr2oa4wooonktpks4'
                //         const tokenUriData = await axios.get("https://ipfs.infura.io/ipfs/" + all +'/0')
                //         if (tokenUriData && tokenUriData.data) {
                //             const imgURL = 'https://ipfs.io/ipfs/' + tokenUriData.data.image.slice(12);
                //             finalURI.push({id: token_id, uri: first+last, img: imgURL})
                //         } else {
                //             finalURI.push({id: token_id, uri: first+last})
                //         }
                //         // https://ipfs.infura.io/ipfs/bafyreicbjbphyvg6mxfspo3k6scvko67ur454dfhg7kqw23ev3ltjbfyoi/2
                //     }
                // }, 1000)
            })
            
        }
        console.log('finalURI', finalURI)
      }, [ownedTokens, address])

    // const approveUserFront = async () => {
    //     setApprovalState(1);
    //     const tx = await approveUser();
    //     // @ts-ignore
    //     if (tx && tx.transaction_hash) {
    //         // @ts-ignore
    //         addTransaction(tx);
    //     }
    // }

    return (
        <div>
            <p>List of owned Tokens </p>
            {finalURI && finalURI.map((item, id) => {
                    return(<p>test</p>)
                }
            )}

            {ownedTokens && ownedTokens.map((item) => {
                    return(<p>{item}</p>)
                }
            )}
             {/* <button className={approvalState==0 ? "btn btn-accent mr-2" : "btn btn-accent mr-2 loading"} onClick={() => approveUserFront() }>Set Approval</button> */}
            {/* <Row style={{ padding: '10px', justifyContent: 'center' }}> */}
                {/* <Button
                    type="primary"
                    onClick={() => set_approval_for_all && set_approval_for_all({ l2TokenAddress, approved: 1 })}
                    style={{ backgroundColor: '#002766', borderColor: '#002766' }}
                >Set Approval for all</Button> */}
            {/* </Row> */}
        </div>
    );
}
