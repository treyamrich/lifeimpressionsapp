import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

type NumberInputProps = {
    label: string;
    initialValue: number;
    isFloat?: boolean;
    decimalPlaceLimit?: number;
    customErrorMsg?: string;
    isValidFn?: (newValue: number) => boolean;
    onChange: (newValue: number, hasError: boolean) => void;
};

const NumberInput = ({ label, initialValue, isFloat, onChange, decimalPlaceLimit = 2, customErrorMsg, isValidFn }: NumberInputProps) => {
    const [inputValue, setInputValue] = useState<string | undefined>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => {
        setInputValue(initialValue?.toString());
    }, []);

    return (
        <TextField
            label={label}
            type="text"
            value={inputValue}
            helperText={errorMsg}
            error={errorMsg !== ""}
            onChange={e => {
                // Remove leading zeros
                let unparsedVal = e.target.value;
                unparsedVal = unparsedVal.replace(/^0+/, '');
                setInputValue(unparsedVal);

                let newErrorMsg: string = "";
                let parsedVal = 0;
                
                if (isFloat) {
                    const floatRegex = new RegExp(`^-?(\\d+(\\.\\d{1,${decimalPlaceLimit}})?|\\.\\d{1,${decimalPlaceLimit}})$`);
                    if(floatRegex.test(unparsedVal) && unparsedVal !== ".0") {
                        parsedVal = parseFloat(unparsedVal);
                    }
                    else {
                        newErrorMsg = "Not a valid decimal value"
                    }
                    if(isNaN(parsedVal)) newErrorMsg = "Not a valid decimal value";
                } else {
                    const integerRegex = /^-?\d+$/;
                    if (integerRegex.test(unparsedVal)) {
                        parsedVal = parseInt(unparsedVal, 10);
                    } else {
                        newErrorMsg = "Not a valid number value"
                    }
                }

                let hasError = newErrorMsg !== "";

                // Ensure we have a valid value before calling client's validationFn
                if(!hasError && isValidFn) {
                    hasError = !isValidFn(parsedVal);
                }

                hasError && customErrorMsg ?
                    setErrorMsg(customErrorMsg) :
                    setErrorMsg(newErrorMsg);
                let newVal = hasError ? 0 : parsedVal;
                onChange(newVal, hasError);
            }}
        />
    )
};

export default NumberInput;