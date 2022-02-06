import React, { useState } from "react";
import { NFTStorage, File, Blob } from 'nft.storage';
import { UploadFile } from '../UploadFile';
import { ConnectedOnly } from "../ConnectedOnly";
import { Contract } from "starknet";
import { useTransactions } from "../../providers/TransactionsProvider";
import { number } from 'starknet';
const { hexToDecimalString } = number;

export function StoreMetadata({ contract }: { contract?: Contract }) {
    const { transactions } = useTransactions();
    const [step, setStep] = useState(0);
    const [minted, setMinted] = useState(0);
    const [bridgeState, setBridgeState] = useState(0);
    // const [errors, setErrors] = useState({});

    const inputArr = [
        {
            type: "",
            value: ""
        }
    ];
    const [attributeArray, setAttributeArray] = useState(inputArr);
    const formArr = [
        {
            name: "",
            description: "",
            supply: "",
            image: "",
            imgHeight: 0,
            imgWidth: 0,
            attributes: attributeArray,
            imgType: "",
            imgName: "",
            uri: ""
        }
    ];
    const [newFile, setNewFile] = useState<File[]>([])
    const [formArray, setFormArray] = useState(formArr);
    // const [uri, setURI] = useState<string[]>([]);
    const [uri, setURI] = useState('');
    const [stored, setStored] = useState(false);
    const [tokensID, setTokensID] = useState<number[]>([]);
    const [supply, setSupply] = useState<number[]>([]);

    interface TFormArray {
        name?: string;
        description?: string;
        supply?: string;
        image?: string;
        imgHeight?: number;
        imgWidth?: number;
        attributes?: {
            type?: string;
            value?: string;
        }
    }
    type TnewFile = {
        files: File;
        formID: number;
    };

    const addForm = () => {
        setFormArray((s: any) => {
            return [
                ...s,
                {
                    name: "",
                    description: "",
                    supply: "",
                    image: "",
                    uri: "",
                    attributes: attributeArray
                }
            ]
        });
    };

    const removeForm = (event: React.MouseEvent<HTMLButtonElement>, formID: number) => {
        let form = [...formArray];
        form.splice(formID, 1);
        setFormArray(form);

        let files = [...newFile];
        files.splice(formID, 1);
        setNewFile(files);
    }

    const addAttribute = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
        setFormArray((s: any) => {
            const newForm = s.slice();
            const newValue = { type: "", value: "" }
            newForm[(id as any)].attributes = [...newForm[(id as any)].attributes, newValue]
            return newForm;
        });
    };

    const updateAttribute = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const attributeId = event.target.id
        const type = attributeId.split('-');
        const inputId = type[1];

        setFormArray((s: any) => {
            const newForm = s.slice();
            const currentAttributes = newForm[(id as any)].attributes;

            if (type[0] == 'value') {
                currentAttributes[(inputId as any)].value = event.target.value;
            } else if (type[0] == 'type') {
                currentAttributes[(inputId as any)].type = event.target.value;
            }
            return newForm;
        });
    }

    const removeAttribute = (event: React.MouseEvent<HTMLButtonElement>, i: number, k: number) => {
        let form = [...formArray];
        let attributes = form[i].attributes;
        attributes.splice(k, 1);

        setFormArray(s => {
            const newForm = s.slice();
            newForm[i].attributes = attributes;
            return newForm;
        })
    }

    const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
        const targetID = event.target.id;
        const splitTarget = targetID.split("-");
        const formId = splitTarget[1];

        setFormArray(s => {
            const newForm = s.slice();
            newForm[(formId as any)].name = event.target.value;
            return newForm;
        })
    }
    const updateDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
        const targetID = event.target.id;
        const splitTarget = targetID.split("-");
        const formId = splitTarget[1];

        setFormArray(s => {
            const newForm = s.slice();
            newForm[(formId as any)].description = event.target.value;
            return newForm;
        })
    }
    const updateSupply = (event: React.ChangeEvent<HTMLInputElement>) => {
        const targetID = event.target.id;
        const splitTarget = targetID.split("-");
        const formId = splitTarget[1];

        setFormArray(s => {
            const newForm = s.slice();
            newForm[(formId as any)].supply = event.target.value;
            return newForm;
        })
    }

    const updateUploadedFiles = async ({ files, formID }: TnewFile) => {
        let objectImage = new Image();
        objectImage.src = URL.createObjectURL(files);

        setNewFile({ ...newFile, [formID]: files });

        objectImage.onload = () => {
            setFormArray(s => {
                const newForm = s.slice();
                newForm[formID].imgHeight = objectImage.height;
                newForm[formID].imgWidth = objectImage.width;
                newForm[formID].image = URL.createObjectURL(files);
                newForm[formID].imgType = files.type;
                newForm[formID].imgName = files.name;
                return newForm;
            });
        }
        console.log('file', files);
        console.log('form Array', formArray);
        console.log('newFile array', newFile);
    }

    const removeUploadedFile = (event: React.MouseEvent<HTMLButtonElement>, formID: number) => {
        delete newFile[formID];
        setNewFile({ ...newFile });
        setFormArray(s => {
            const newForm = s.slice();
            newForm[formID].imgHeight = 0;
            newForm[formID].imgWidth = 0;
            newForm[formID].image = '';
            return newForm;
        });
    };

    const storeAndMint = async () => {
        setMinted(1);
        const client = new NFTStorage({ token: process.env.REACT_APP_API_KEY as string });

        const tokensIDs: number[] = [];
        const supplyTokens: number[] = [];
        // const listURIs : string[] = [];
        const directory = [];
        const nextTokenID = '1';
        const nextID = parseInt(hexToDecimalString(nextTokenID));

        console.log('newFile', newFile);

        if (newFile && formArray) {
            for (var id in formArray) {

                tokensIDs.push(parseInt(id) + nextID);
                supplyTokens.push(parseInt(formArray[id].supply));

                const properties = {};
                const attributes = formArray[id].attributes;
                for (var key in attributes) {
                    const type = attributes[key].type;
                    const value = attributes[key].value;
                    const newAttr = { [type]: value };
                    Object.assign(properties, newAttr);
                }
                // save into IPFS directory
                const metadata = {
                    name: formArray[id].name,
                    description: formArray[id].description,
                    image: `ipfs://${formArray[id].image}`,
                    properties: properties
                }
                directory.push(
                    new File([JSON.stringify(metadata, null, 2)], `${id + nextID}`, { type: newFile[id].type })
                )

                // const metadata = await client.store({
                //     name: formArray[id].name,
                //     description: formArray[id].description,
                //     image : new File([`ipfs://${formArray[id].image}`], formArray[id].imgName, { type : formArray[id].imgType }),
                //     properties: properties
                // })
                // console.log('metadata for image is', metadata);

                // setFormArray(s => {
                //     const newForm = s.slice();
                //     newForm[id].uri = metadata.url;
                //     return newForm; 
                // });
                // listURIs.push(metadata.url);
            }
            setTokensID(tokensIDs);
            setSupply(supplyTokens);
            // setURI(listURIs);
            // console.log('listURIs', listURIs);
        }
        console.log('directory', directory);
        const pinnedDir = await client.storeDirectory(directory);
        console.log('pinnedDir', pinnedDir);
        const status = await client.status(pinnedDir);
        console.log('status of IPFS', status);

        if (pinnedDir) {
            setStored(true);
            setURI(pinnedDir);
            setMinted(0);
            // await MintNFT((tokensIDs as []), (supplyTokens as []), pinnedDir);
        } else {
            setStored(false);
            setMinted(0);
        }
        // if (listURIs.length == tokensIDs.length) {
        //     setStored(true);
        //     await MintNFT((tokensID as []), (supplyTokens as []));
        // } else {
        //     setStored(false);
        // }
    }

    // React.useEffect(() => {
    //     if (stored && minted==1 && !submitting) {
    //       console.log('minted = 1 && pas submitting');
    //       if (transactionStatus && (transactionStatus.code == 'REJECTED')) {
    //         setMinted(2)
    //         console.log('dans if');
    //       } else if (submitting == false && transactionStatus && (transactionStatus.code == 'ACCEPTED_ON_L1' || transactionStatus.code == 'ACCEPTED_ON_L2')) {
    //         setStep(1);
    //         console.log('dans else');
    //       }
    //     }
    //   }, [stored, minted, submitting, transactionStatus])

    const MintNFT = async (tokensID: [], supplyTokens: [], directory: string) => {
        setMinted(1);
        // const tx = await mint1155NFT(tokensID, supplyTokens);
        // @ts-ignore
        // if (tx && tx.transaction_hash) {
        //     // @ts-ignore
        //     addTransaction(tx);
        // }
    }

    // const ConsumeInL1 = async () => {
    //     setBridgeState(1);
    //     const tx = await bridgeFromL2(tokensID as [], supply as []);
    //     // @ts-ignore
    //     if (tx && tx.transaction_hash) {
    //         // @ts-ignore
    //         addTransaction(tx);
    //     }
    // }

    // Helper functions
    const range = (start: number, stop: number, step: number) => {
        var a = [start], b = start;
        while (b < stop) {
            a.push(b += step || 1);
        }
        return a;
    }
    const mintToken = () => {
        setStep(3)
    }

    const selectNextHandler = () => {
        console.log(step);
        // console.log(standard);
        switch (step < 4) {
            case step == 0:
                setStep((prevActiveStep) => prevActiveStep + 1);
                break
            case step == 1:
                setStep((prevActiveStep) => prevActiveStep + 1);
                break
            case step == 2:
                // const [userValid, addrValid, artValid, descValid, discordValid] = verifyFormData();
                // console.log(userValid);
                // console.log(addrValid);
                // console.log(artValid);
                // console.log(descValid);
                // console.log(discordValid);
                // setIsValid({
                //     username: userValid,
                //     artname: artValid,
                //     ethadd: addrValid,
                //   });
                // if (discord.length > 0) { 
                //   setDscValid(discordValid);
                // }
                // if (userValid && addrValid && artValid && descValid) {
                //   setStep((prevActiveStep) => prevActiveStep + 1);
                // }
                break
            //   case step==3 && img!=null:
            // setStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const selectPrevHandler = () => {
        if (step > 0) {
            setStep((prevActiveStep) => prevActiveStep - 1);
            console.log('next');
        } else {
            console.log('no');
        }
    };

    return (
        <>
            <div className="p-5">
                {/* {step == 5 && ownedTokens.length > 0 ?
                    <>
                        <div className="alert alert-info background-neutral">
                            <div className="flex-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <label className="text-primary">It seems you already have some test NFTs, bridge them now! <a className="color-accent underline" onClick={() => selectNextHandler()}> Go to next step</a></label>
                            </div>
                        </div>
                    </>
                    : ''
                } */}
                <div className="alert alert-info background-neutral">
                    <div className="flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <label className="text-primary">You can mint NFT already Bridge on L1<a className="color-accent underline" onClick={() => mintToken()}> Mint NFT</a></label>
                    </div>
                </div>
                <ul className="w-full steps">
                    <li data-content={step == 0 ? "1" : "✓"} className={step == 0 ? "step" : "step step-accent"}>Create collectibles on Starknet</li>
                    <li data-content={step < 2 ? "2" : "✓"} className={step < 1 ? "step" : "step step-accent"}>Bridge to L1</li>
                    <li data-content={step < 3 ? "3" : "✓"} className={step < 2 ? "step" : "step step-accent"}>Get your NFTs on L1</li>
                    <li data-content={step < 4 ? "4" : "✓"} className={step < 3 ? "step" : "step step-accent"}>Mint NFT on L1</li>
                </ul>
                <p>step = {step}</p>
            </div>
            {step == 0 &&
                <>
                    <div className="grid grid-cols-2 gap-5 px-10">

                        {formArray.map((item, i) => {
                            return (
                                <div className="col-span-1 indicator" style={{ display: "block", width: "100%" }} key={i}>
                                    {i != 0 ?
                                        <div className="indicator-item">
                                            <button className="btn btn-circle btn-sm btn-secondary" onClick={(event) => removeForm(event, i)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                </svg>
                                            </button>
                                        </div>
                                        : ''
                                    }
                                    <div id={'card-' + `${i}`} className="card rounded-lg shadow-2xl px-10 py-5 mb-3">

                                        <div className="indicator" style={{ width: "100%" }}>
                                            <div style={{ border: "2px dotted gray", borderRadius: "16px" }} className="px-10 py-10 container relative">
                                                {item && item.image ?
                                                    <>
                                                        <div className="indicator-item">
                                                            <button className="btn btn-circle btn-sm btn-secondary" onClick={(event) => removeUploadedFile(event, i)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div className="center-cnt">
                                                            <img src={item.image} height={item.imgHeight} width={item.imgWidth}></img>
                                                        </div>
                                                    </>
                                                    :
                                                    <UploadFile updateFilesCb={updateUploadedFiles as React.Dispatch<React.SetStateAction<TnewFile>>} formID={i} />
                                                }
                                            </div>
                                        </div>
                                        <div className="py-5">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Name</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id={'name-' + `${i}`}
                                                    placeholder="Name of your NFT"
                                                    className="input input-bordered"
                                                    onChange={updateName}
                                                />
                                            </div>
                                        </div>
                                        <div className="">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Description (Optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Description of your NFT"
                                                    id={'description-' + `${i}`}
                                                    className="input input-bordered"
                                                    onChange={updateDesc}
                                                />
                                            </div>
                                        </div>
                                        <div className="py-5">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Number of copies</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Amount of token to mint"
                                                    id={'supply-' + `${i}`}
                                                    className="input input-bordered"
                                                    onChange={updateSupply}
                                                />
                                            </div>
                                        </div>
                                        <div className="" id={'attributes-' + `${i}`}>
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Properties (Optional)</span>
                                                </label>
                                                {item && item.attributes && item.attributes.map((elmts, k) => {
                                                    return (
                                                        <div className="mb-3" key={k} >
                                                            <input id={'type-' + `${k}`} type="text" placeholder="e.g. Size" className="input input-bordered mr-2 w-40" onChange={(event) => updateAttribute(event, i)} />
                                                            <input id={'value-' + `${k}`} type="text" placeholder="e.g. M" className="input input-bordered mr-2" onChange={(event) => updateAttribute(event, i)} />
                                                            <button className="btn btn-square btn-sm btn-secondary" onClick={(event) => removeAttribute(event, i, k)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                <button className="btn btn-secondary" onClick={(event) => addAttribute(event, i)}>Add another attribute</button>
                                            </div>
                                        </div>
                                        {/* {errors ? (
                                        <div className="alert alert-error my-2">
                                            <div className="flex-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    className="w-6 h-6 mx-2 stroke-current"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                                    ></path>
                                                </svg>
                                                <label>{errors}</label>
                                            </div>
                                        </div>
                                    ) : (
                                        ""
                                    )} */}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="col-span-1">
                            <div className="card rounded-lg shadow-2xl px-5 py-10">
                                <p className="text-center text-md">Create another collectible</p>
                                <div className="center-cnt my-2">
                                    <button className="btn btn-square btn-lg btn-secondary" onClick={addForm}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className=""><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="center-cnt py-2">
                        <ConnectedOnly>
                            {!stored ?

                                <button className={minted == 0 ? "btn btn-accent mr-2" : "btn btn-accent mr-2 loading"} onClick={() => storeAndMint()}>Store metadata on IPFS </button>
                                :
                                <button className={minted == 0 ? "btn btn-accent mr-2" : "btn btn-accent mr-2 loading"} onClick={() => MintNFT(tokensID as [], supply as [], uri)}>Mint your NFTs </button>
                            }
                            {/* {minted == 0 || minted == 1 ? 
                                <button className={minted==0 ? "btn btn-accent mr-2" : "btn btn-accent mr-2 loading"} onClick={() => storeAndMint() }>Store and Mint NFT </button>
                                : 
                                <>
                                    <p>Error while minting, retry minting</p><br/>
                                    <button className={minted==2 ? "btn btn-accent mr-2" : "btn btn-accent mr-2 loading"} onClick={() => MintNFT(tokensID as [], supply as [], uri) }>Mint your NFTs </button>
                                </>
                            } */}
                        </ConnectedOnly>
                    </div>

                </>}
        </>
    );
}
