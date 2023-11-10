import { matchIsValidTel } from "mui-tel-input";

/*
    Only supporting US numbers. 
    Returns the trimmed string if it's valid. 
    If the value is just the area code, returns empty string.
*/
export const validatePhoneNumber = (str: string): string | undefined => {
    const phoneNumberRegex = /^\+1 \d{3} \d{3} \d{4}$/;
    const trimmedStr = str.trim();
    if (phoneNumberRegex.test(trimmedStr) && matchIsValidTel(trimmedStr))
        return trimmedStr;
    if (trimmedStr === "+1" || trimmedStr === "")
        return "";
    return undefined;
}