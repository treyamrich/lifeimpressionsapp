import { TShirt } from "@/API";
import { Autocomplete, AutocompleteRenderInputParams, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { SelectValue } from "../forms/create-entity-forms/tshirt/create-tshirt-constants";

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

const SelectField = ({ label, name, value, onChange, selectOptions }: {
    label: string;
    name: string;
    value: any;
    onChange: (newValue: any) => void;
    selectOptions: SelectValue[];
}) => (
    <TextField
        select
        label={label}
        name={name}
        onChange={onChange}
        value={value}
    >
        {selectOptions.map((selectInput, idx) => (
            <MenuItem value={selectInput.value} key={`${selectInput.label}-${idx}`}>
                {selectInput.label}
            </MenuItem>
        ))}
    </TextField>
);

const TShirtPicker = ({ choices, onChange, errorMessage }: {
    choices: TShirt[];
    onChange: (newValue: TShirt | null) => void;
    errorMessage?: string;
}) => {
    const [pickerState, setPickerState] = useState<TShirtPickerState>({ ...initialTShirtPickerState });

    const tshirtsByStyleNumber = choices.filter(tshirt => tshirt.styleNumber === pickerState.tshirtStyleNo);
    const availableTShirtColors = tshirtsByStyleNumber.map(tshirt => ({ label: tshirt.color, value: tshirt.color }));
    const availableTShirtSizes = tshirtsByStyleNumber.map(tshirt => ({ label: tshirt.size, value: tshirt.size }));

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
                options={choices.map(tshirt => tshirt.styleNumber)}
                getOptionLabel={(option: string) => option}
                autoComplete
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
                value={pickerState.tshirtSize}
                onChange={e => handleFieldChange(TShirtPickerFields.tshirtSize, e.target.value)}
                selectOptions={availableTShirtSizes}
            />
            <SelectField
                label="Color"
                name="tshirtColor"
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