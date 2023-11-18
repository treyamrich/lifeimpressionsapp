import { validateEmail, validatePhoneNumber } from "../field-validation";

describe('Field Validation', () => {
    describe('Phone Number Validation', () => {
        it('should return trimmed values with valid phone numbers', () => {
            const validPhoneNums = [
                '+1 808 226 2515',
                ' +1 323 515 1534 '
            ];
            validPhoneNums.forEach(x => expect(validatePhoneNumber(x)).toBe(x.trim()))
        })

        it('should fail invalid phone numbers', () => {
            const invalidPhoneNums = [
                '+33 808 226 2515',
                '+1 012 515 1534'
            ]
            invalidPhoneNums.forEach(x => expect(validatePhoneNumber(x)).toBeUndefined())
        })

        it('should return empty string with spaces or just country code', () => {
            const edgecases = [' ', ' +1 ', '+1'];
            edgecases.forEach(x => expect(validatePhoneNumber(x)).toBe(""))
        })
    })

    describe('Email Validation', () => {
        it('should return trimmed values with valid emails', () => {
            const validPhoneNums = [
                'a@a.com ',
                ' Aasdf@asdf.com '
            ];
            validPhoneNums.forEach(x => expect(validateEmail(x)).toBe(x.trim()))
        })

        it('should fail invalid emails', () => {
            const invalidPhoneNums = [
                'asdfasdf',
                'asdf@.com',
                'asdf.com'
            ]
            invalidPhoneNums.forEach(x => expect(validateEmail(x)).toBeUndefined())
        })

        it('should return empty string with empty email', () => {
            const edgecases = [' ', '', '    '];
            edgecases.forEach(x => expect(validateEmail(x)).toBe(""))
        })
    })
})