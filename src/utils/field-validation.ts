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
    const isEmptyPhonenumber = trimmedStr === "+1" || trimmedStr === "";
    return isEmptyPhonenumber ? "" : undefined;
}

export const EMAIL_LEN_LIM = 255;
export const validateEmail = (str: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedStr = str.trim();
    if(emailRegex.test(trimmedStr) && trimmedStr.length < EMAIL_LEN_LIM) {
        return trimmedStr;
    }
    return trimmedStr === "" ? "" : undefined;
}

export const validateISO8601 = (str: string) => {
    const iso8601Regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{3})?([Zz]|([+-])(\d{2}):(\d{2}))$/;
    return iso8601Regex.test(str);
}