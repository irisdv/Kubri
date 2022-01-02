import React, { useState } from "react";
import { NFTStorage, File, Blob  } from 'nft.storage';
import axios from 'axios';

import { UploadFile } from '../UploadFile';
import { ConnectedOnly } from "../ConnectedOnly";
import { Mint1155NFT } from "../Mint1155NFT";
import { Contract } from "starknet";

export function StoreMetadata({ contract }: { contract?: Contract }) {
    const [step, setStep] = useState(0);
    const [errors, setErrors] = useState("");

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
          attributes: attributeArray
        }
      ];
    const [newFile, setNewFile] = useState<File[]>([])
    const [formArray, setFormArray] = useState(formArr);
    const [uri, setURI] = useState('');
    const [stored, setStored] = useState(false);

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
        setFormArray((s : any) => {
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

    const removeForm = (event : React.MouseEvent<HTMLButtonElement>, formID : number) => {
        let form = [...formArray];
        form.splice(formID, 1);
        setFormArray(form);
        
        let files = [...newFile];
        files.splice(formID, 1);
        setNewFile(files);
    }

    const addAttribute = (event: React.MouseEvent<HTMLButtonElement>, id :number) => {
        setFormArray((s : any) => {
            const newForm = s.slice();
            const newValue = { type: "", value: "" }
            newForm[(id as any)].attributes = [...newForm[(id as any)].attributes, newValue]
            return newForm;
        });
    };

    const updateAttribute = (event : React.ChangeEvent<HTMLInputElement>, id : number) => {
        const attributeId = event.target.id
        const type = attributeId.split('-');
        const inputId  = type[1];

        setFormArray((s : any) => {
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

    const removeAttribute = (event : React.MouseEvent<HTMLButtonElement>, i : number, k : number) => {
        let form = [...formArray];
        let attributes = form[i].attributes;
        attributes.splice(k, 1);

        setFormArray(s => {
            const newForm = s.slice();
            newForm[i].attributes = attributes;
            return newForm;
        })
    }

    const updateName = (event : React.ChangeEvent<HTMLInputElement>) => {
        const targetID = event.target.id;
        const splitTarget = targetID.split("-");
        const formId = splitTarget[1];

        setFormArray(s => {
            const newForm = s.slice();
            newForm[(formId as any)].name = event.target.value;
            return newForm;
        })
    }
    const updateDesc = (event : React.ChangeEvent<HTMLInputElement>) => {
        const targetID = event.target.id;
        const splitTarget = targetID.split("-");
        const formId = splitTarget[1];

        setFormArray(s => {
            const newForm = s.slice();
            newForm[(formId as any)].description = event.target.value;
            return newForm;
        })
    }
    const updateSupply = (event : React.ChangeEvent<HTMLInputElement>) => {
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

        setNewFile({...newFile, [formID] : files });

        objectImage.onload = () => {
            setFormArray(s => {
                const newForm = s.slice();
                newForm[formID].imgHeight = objectImage.height;
                newForm[formID].imgWidth = objectImage.width;
                newForm[formID].image = URL.createObjectURL(files);
                return newForm; 
            });
        }
        console.log('file', files);
        console.log('form Array', formArray);
        console.log('newFile array', newFile);
    }

    const removeUploadedFile = (event : React.MouseEvent<HTMLButtonElement>, formID : number) => {
        delete newFile[formID];
        setNewFile({...newFile});
        setFormArray(s => {
            const newForm = s.slice();
            newForm[formID].imgHeight = 0;
            newForm[formID].imgWidth = 0;
            newForm[formID].image = '';
            return newForm;
        });
    };

    const storeNFT = async () => {
        const client = new NFTStorage({ token : process.env.REACT_APP_API_KEY as string });
        const directory = [];

        if (newFile && formArray) {
            for (var id in formArray) {

                const properties = {};
                const attributes = formArray[id].attributes;
                for (var key in attributes) {
                    const type = attributes[key].type;
                    const value = attributes[key].value;
                    const newAttr = { [type] : value };
                    Object.assign(properties, newAttr);
                }

                const metadata = {
                    name: formArray[id].name,
                    description: formArray[id].description,
                    image: `ipfs://${formArray[id].image}`,
                    properties: properties
                }

                directory.push(
                    new File([JSON.stringify(metadata, null, 2)], `${id}`, { type: newFile[id].type })
                );
            }
        }
        console.log('directory', directory);
        const pinnedDir = await client.storeDirectory(directory);
        console.log('pinnedDir', pinnedDir);
        // pinnedDir = bafybeifvckoqkr7wmk55ttuxg2rytfojrfihiqoj5h5wjt5jtkqwnkxbie

        if (pinnedDir) {
            setStored(true);
            setURI(pinnedDir)
            return pinnedDir;
        } else {
            setStored(false);
        }
      }

    const loadNFT = async () => {
        // console.log("https://ipfs.infura.io/ipfs/" + uri.slice(7))
        const test = 'https://bafybeibvdisrr4razcg6pc7hrosmqmi6726u3w5da2rzmuaenxs6fcqt4q/0';
        const testMeta = await axios.get("https://ipfs.infura.io/ipfs/" + test.slice(8))
        console.log('meta', testMeta);
        const url = 'https://ipfs.io/ipfs/' + testMeta.data.image.slice(12);
        // testMeta.data.image = "ipfs://blob:http://localhost:3100/96d8bcf2-37ae-48a1-9efd-b72a5c6e3f22"


        // const meta = await axios.get("https://ipfs.infura.io/ipfs/" + uri.slice(7))
        // const url = 'https://ipfs.io/ipfs/' + meta.data.image.slice(7);
        
        console.log('url', url)
        // setMeta(meta.data);
        // setUrlNFT(url);
    };

    // Helper functions
    const range = (start: number, stop : number, step : number) => {
        var a = [start], b = start;
        while (b < stop) {
            a.push(b += step || 1);
        }
        return a;
    }

    const selectNextHandler = () => {
        console.log(step);
        // console.log(standard);
        switch (step < 4) {
          case step==0:
            setStep((prevActiveStep) => prevActiveStep + 1);
            break
          case step==1:
            setStep((prevActiveStep) => prevActiveStep + 1);
            break
          case step==2:
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
        if (step > 0 ) {
          setStep((prevActiveStep) => prevActiveStep - 1);
          console.log('next');
        } else {
          console.log('no');
        }
      };
    
    // function for testing purposes
    const loadInfo = () => {
        console.log('state formArray', formArray);
    }


    return (
        <>
            <div className="p-5">
                <h2 className="title text-3xl mb-1 mx-auto text-center font-bold text-purple-700">Create collectibles on Starknet</h2>
                <div>
                    <button className="btn btn-primary mr-2" onClick={() => storeNFT()}>Store NFT on IPFS</button>
                    <button className="btn btn-primary mr-2" onClick={() => loadNFT()}>Load NFT metadata</button>
                    {/* {urlNFT? <img src={urlNFT} /> : ''}  */}

                    <button className="btn btn-primary mb-3" onClick={() => loadNFT()}>Mint NFT</button>
                    {/* <ConnectedOnly>
                        <Mint1155NFT contract={contract} toMint={formArray as TFormArray} />
                    </ConnectedOnly> */}
                    <div><button className="btn btn-primary mr-2" onClick={() => loadInfo()}>Load info states</button></div>
                </div>

                {/* <ul className="w-full steps">
                    <li data-content={step==0 ? "1" : "✓"} className={step==0 ? "step" : "step step-info"}>Create collectibles on Starknet</li>
                    <li data-content={step<1 ? "2" : "✓"} className={step<1 ? "step" : "step step-info"}>Details</li>
                    <li data-content={step<2 ? "3" : "✓"} className={step<2 ? "step" : "step step-info"}>Details</li>
                    <li data-content={step<3 ? "4" : "✓"} className={step<3 ? "step" : "step step-info"}>Upload Image</li>
                    <li data-content={step<4 ? "5" : "✓"} className={step<4 ? "step" : "step step-info"}>List NFT</li>
                </ul> */}
            </div>

            {step==0 &&
                <>
                    <div className="grid grid-cols-2 gap-3 px-10">

                    {formArray.map((item, i) => {
                        return (                            
                            <div className="col-span-1 indicator" key={i}>
                                {i != 0 ? 
                                    <div className="indicator-item">
                                        <button className="btn btn-circle btn-sm" onClick={(event) => removeForm(event, i)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">   
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>                       
                                            </svg>
                                        </button> 
                                    </div>
                                    : ''
                                }
                                <div id={'card-'+`${i}`} className="card rounded-lg shadow-2xl px-10 py-5 mb-3">
                                
                                    <div className="indicator" style={{width: "100%"}}>
                                        <div style={{border: "2px dotted gray", borderRadius: "16px"}} className="px-10 py-10 container relative">
                                            {item && item.image ? 
                                                <>
                                                <div className="indicator-item">
                                                    <button className="btn btn-circle btn-sm" onClick={(event) => removeUploadedFile(event, i)}>
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
                                                id={'name-'+`${i}`} 
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
                                                id={'description-'+`${i}`} 
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
                                                id={'supply-'+`${i}`} 
                                                className="input input-bordered" 
                                                onChange={updateSupply} 
                                            />
                                        </div>
                                    </div>
                                    <div className="" id={'attributes-'+`${i}`}>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Properties (Optional)</span>
                                            </label> 
                                            {item && item.attributes && item.attributes.map((elmts, k) => {
                                                return (
                                                    <div className="mb-3" key={k} >
                                                        <input id={'type-'+`${k}`} type="text" placeholder="e.g. Size" className="input input-bordered mr-2" onChange={(event) => updateAttribute(event, i)} />
                                                        <input id={'value-'+`${k}`} type="text" placeholder="e.g. M" className="input input-bordered mr-2" onChange={(event) => updateAttribute(event, i)} />
                                                        <button className="btn btn-square btn-sm" onClick={(event) => removeAttribute(event, i, k)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">   
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>                       
                                                        </svg>
                                                        </button> 
                                                    </div>
                                                );
                                            })}
                                            <button className="btn btn-accent" onClick={(event) => addAttribute(event, i)}>Add another attribute</button>
                                        </div>
                                    </div>
                                    {errors ? (
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
                                    )}

                                    
                                </div>
                            </div>
                        );
                    })}

                    <div className="col-span-1">
                        <div className="card rounded-lg shadow-2xl px-5 py-10">
                            <p className="text-center">Create another collectible</p>
                            <div className="center-cnt my-2">
                                <button className="btn btn-square btn-lg" onClick={addForm}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">   
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"></path>                       
                                    </svg>
                                </button> 
                            </div>
                        </div>
                    </div>

                    </div>

                </>}
        </>
    );
}
