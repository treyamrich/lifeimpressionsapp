import { TShirt } from "@/API";
import { Autocomplete, AutocompleteRenderInputParams, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { SelectValue, tshirtSizeToLabel } from "../../../inventory/create-tshirt-constants";

type TShirtPickerState = {
    inputValue: string;
    tshirtStyleNo: string | null;
    tshirtSize: string;
    tshirtColor: string;
}

const initialTShirtPickerState: TShirtPickerState = {
    inputValue: '',
    tshirtStyleNo: null,
    tshirtSize: '',
    tshirtColor: ''
}

enum TShirtPickerFields {
    tshirtStyleNo = "tshirtStyleNo",
    tshirtSize = "tshirtSize",
    tshirtColor = "tshirtColor",
    inputValue = "inputValue",
}

const SelectField = ({ label, name, value, onChange, selectOptions, disabled }: {
    label: string;
    name: string;
    value: any;
    onChange: (newValue: any) => void;
    selectOptions: SelectValue[];
    disabled?: boolean;
}) => (
    <TextField
        select
        label={label}
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled}
    >
        {selectOptions.map((selectInput, idx) => (
            <MenuItem value={selectInput.value} key={`${selectInput.label}-${idx}`}>
                {selectInput.label}
            </MenuItem>
        ))}
    </TextField>
);

const TShirtPicker = ({ choices, onChange, errorMessage, disabled }: {
    choices: TShirt[];
    onChange: (newValue: TShirt | null) => void;
    errorMessage?: string;
    disabled?: boolean;
}) => {
    const [pickerState, setPickerState] = useState<TShirtPickerState>({ ...initialTShirtPickerState });

    const uniqueStyleNumbers = Array.from(new Set(choices.map(tshirt => tshirt.styleNumber)));

    const tshirtsByStyleNumber = choices.filter(tshirt => tshirt.styleNumber === pickerState.tshirtStyleNo);

    const availableTShirtSizes = Array.from(new Set(
        tshirtsByStyleNumber.map(tshirt => tshirt.size)
    )).map(size => ({ label: tshirtSizeToLabel[size], value: size }));

    // Should have no duplicate colors at this point since there can't be duplicate (style no, size, color) records
    const tshirtsByStyleNumberAndSize = tshirtsByStyleNumber.filter(tshirt => tshirt.size === pickerState.tshirtSize);
    const availableTShirtColors = tshirtsByStyleNumberAndSize.map(tshirt => ({ label: tshirt.color, value: tshirt.color }));

    const handleFieldChange = (fieldName: string, newValue: any) => {
        const newPickerState = { ...pickerState, [fieldName]: newValue };
        let foundShirt = choices.find(tshirt => tshirt.styleNumber === newPickerState.tshirtStyleNo &&
            tshirt.size === newPickerState.tshirtSize &&
            tshirt.color === newPickerState.tshirtColor
        );
        let pickedShirt = foundShirt ? foundShirt : null;

        // Reset color & size selection when style number changes
        if (fieldName === TShirtPickerFields.tshirtStyleNo) {
            newPickerState.tshirtSize = '';
            newPickerState.tshirtColor = '';
        }

        onChange(pickedShirt ? pickedShirt : null);
        setPickerState(newPickerState);
    }

    return (

        <Stack
            sx={{
                width: "100%",
                minWidth: { xs: "300px", sm: "360px", md: "400px" },
                gap: "2rem",
            }}
        >

            <Autocomplete
                id="tshirt-auto-complete"
                options={uniqueStyleNumbers}
                getOptionLabel={(option: string) => option}
                autoComplete
                disabled={disabled}
                renderInput={(params: AutocompleteRenderInputParams) => (
                    <TextField
                        {...params}
                        label="Style No."
                        variant="standard"
                    />
                )}
                value={pickerState.tshirtStyleNo}
                onChange={(event, newValue) => handleFieldChange(TShirtPickerFields.tshirtStyleNo, newValue)}
                inputValue={pickerState.inputValue}
                onInputChange={(event, newInputValue) => handleFieldChange(TShirtPickerFields.inputValue, newInputValue)}
                renderOption={(props, option) => {
                    return (
                        <li {...props} key={option}>
                            {option}
                        </li>
                    );
                }}
                renderTags={(tagValue, getTagProps) => {
                    return tagValue.map((option, index) => (
                        <Chip
                            {...getTagProps({ index })}
                            key={`tag${index}`}
                            label={option}
                        />
                    ));
                }}
            />
            <SelectField
                label="Size"
                name="tshirtSize"
                disabled={disabled}
                value={pickerState.tshirtSize}
                onChange={e => handleFieldChange(TShirtPickerFields.tshirtSize, e.target.value)}
                selectOptions={availableTShirtSizes}
            />
            <SelectField
                label="Color"
                name="tshirtColor"
                disabled={disabled}
                value={pickerState.tshirtColor}
                onChange={e => handleFieldChange(TShirtPickerFields.tshirtColor, e.target.value)}
                selectOptions={availableTShirtColors}
            />

            {errorMessage !== "" && (
                <Typography variant="body1" color="error">{errorMessage}</Typography>
            )}
        </Stack>
    )
}

export default TShirtPicker;