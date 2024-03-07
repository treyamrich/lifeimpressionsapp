import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

type StrictIntegerInput = {
    label?: string;
    initialValue: number;
    onChange: (newValue: number, hasError: boolean) => void;
    placeholder?: string;
    name: string;
};

const StrictIntegerInput = ({ label, initialValue, onChange, placeholder, name }: StrictIntegerInput) => {
    const [inputValue, setInputValue] = useState<string | undefined>("");

    useEffect(() => {
        setInputValue(initialValue?.toString());
    }, [initialValue]);

    return (
        <TextField
            label={label}
            type="text"
            name={name}
            value={inputValue}
            placeholder={placeholder}
            onChange={e => {
                // Remove leading zeros
                let unparsedVal = e.target.value;
                setInputValue(unparsedVal);

                let hasError = false;
                let parsedVal = 0;

                const integerRegex = /^-?\d+$/;
                if (integerRegex.test(unparsedVal)) {
                    parsedVal = parseInt(unparsedVal, 10);
                } else {
                    hasError = true;
                }

                let newVal = hasError ? 0 : parsedVal;
                onChange(newVal, hasError);
            }}
        />
    )
};

export default StrictIntegerInput;