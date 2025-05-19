import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

type NumberInputProps = {
    label: string;
    initialValue: string;
    isFloat?: boolean;
    decimalPlaceLimit?: number;
    isValidFn?: (newValue: string) => string;
    onChange: (newValue: string, hasError: boolean) => void;
    placeholder?: string;
    name: string;
};

// onChange passes a new updated value. if hasError is true then the value is always 0.
const NumberInput = ({ label, initialValue, isFloat, onChange, decimalPlaceLimit = 2, isValidFn, placeholder, name }: NumberInputProps) => {
    const [inputValue, setInputValue] = useState<string | undefined>("");
    const [errorMsg, setErrorMsg] = useState<string>("");

    useEffect(() => {
        setInputValue(initialValue?.toString());
    }, [initialValue]);

    return (
        <TextField
            label={label}
            type="text"
            name={name}
            value={inputValue}
            helperText={errorMsg}
            error={errorMsg !== ""}
            placeholder={placeholder}
            onChange={e => {
                // Remove leading zeros
                let unparsedVal = e.target.value;
                setInputValue(unparsedVal);

                let newErrorMsg: string = "";

                const integerRegex = /^-?\d+$/;
                const floatRegex = new RegExp(`^-?(\\d+(\\.\\d{1,${decimalPlaceLimit}})?|\\.\\d{1,${decimalPlaceLimit}})$`);

                if (isFloat) {
                    let parsedVal = parseFloat(unparsedVal);
                    if (!floatRegex.test(unparsedVal) || unparsedVal === ".0" || isNaN(parsedVal)) {
                        newErrorMsg = "Not a valid decimal value"
                    }
                } else {
                    let parsedVal = parseInt(unparsedVal, 10);
                    if (!integerRegex.test(unparsedVal) || isNaN(parsedVal)) {
                        newErrorMsg = "Not a valid number value"
                    }
                }

                let hasError = newErrorMsg !== "";
                // Ensure we have a valid value before calling client's validationFn
                if (!hasError && isValidFn) {
                    newErrorMsg = isValidFn(unparsedVal);
                    hasError = newErrorMsg !== "";
                }
                setErrorMsg(newErrorMsg)
                onChange(unparsedVal, hasError);
            }}
        />
    )
};

export default NumberInput;