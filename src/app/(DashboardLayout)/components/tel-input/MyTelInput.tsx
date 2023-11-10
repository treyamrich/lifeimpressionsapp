import { FormGroup, Typography } from "@mui/material";
import { MuiTelInput } from "mui-tel-input";

type MyTelInputProps = {
    value: string;
    onChange: (newVal: string) => void;
    errorMsg?: string;
}

// Default component only accepts US phone numbers
const MyTelInput = ({ value, onChange, errorMsg }: MyTelInputProps) => (
    <FormGroup>
        <MuiTelInput
            value={value}
            onChange={(newVal, info) => {
                // The tel input loses spaces after > 15 chars
                const numGroups = newVal.split(' ').length;
                const isValidTel = !(numGroups == 2 && newVal.length >= 14);
                if (isValidTel)
                    onChange(newVal)
            }}
            onlyCountries={['US']}
            defaultCountry="US"
            forceCallingCode
            placeholder={'234 567 8910'}
        />
        {errorMsg && (
            <Typography color={'error'}>
                {errorMsg}
            </Typography>
        )}
    </FormGroup>
);

export default MyTelInput;