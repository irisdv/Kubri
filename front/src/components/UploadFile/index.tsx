import React, { useState, useRef } from "react";
import { FileUploadButton } from "../../styles/file-upload.styles";

type TnewFile = {
    files: File;
    formID: number;
};

export function UploadFile({ updateFilesCb, formID }: { updateFilesCb?: React.Dispatch<React.SetStateAction<TnewFile>> , formID : number}) {

    const hiddenFileInput = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState({});

    const handleClick = () : void => {
        hiddenFileInput.current?.click();
      }
    
    const onChangeHandler = (event : React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;

        if (input.files?.length) {
            let updatedFiles = input.files[0];

            setFiles(updatedFiles);
            callUpdateFilesCb(updatedFiles);

        }
    }

    // const convertNestedObjectToArray = (nestedObj : Object) =>
    //     Object.keys(nestedObj).map((key) => nestedObj[key]);    

    const callUpdateFilesCb = (files : File) => {
        // const filesAsArray = convertNestedObjectToArray(files);
        // updateFilesCb(filesAsArray);

        console.log('formID in Upload File component is', formID);

        if (updateFilesCb) {
            updateFilesCb({files, formID});
        }
      };

    return(
        <>
            <div>
                <p className="text-center">Upload your file.</p>
                <p className="text-center">Supported files: JPG, PNG, JPEG, GIF</p>

                <div className="center-cnt my-5">
                    <FileUploadButton 
                        type="button" 
                        onClick={() => handleClick()}
                    >
                        <span>Choose file</span>
                    </FileUploadButton>
                </div>
                <input 
                    type="file" 
                    name="file" 
                    ref={hiddenFileInput}
                    onChange={(event) => onChangeHandler(event)} 
                    style={{display: 'none'}}
                />
            </div>
        </>
    );

}