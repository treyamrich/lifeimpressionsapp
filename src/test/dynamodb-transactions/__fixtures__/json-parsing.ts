import { ParameterizedStatement } from "@aws-sdk/client-dynamodb";

export const findLastOccurrence = (substring: string, char: string): number => {
    for (let i = substring.length - 1; i >= 0; i--) {
        if (substring[i] === char) {
            return i;
        }
    }
    return -1;
}

// Can be used for partiql statements that have UPDATE in it
export const compileUpdateStatement = (statement: ParameterizedStatement): string => {
    let res = "";
    let n = statement.Statement ? statement.Statement.length : 0;
    let j = 0;
    let parameters = statement.Parameters ? statement.Parameters : [];

    let i = 0;
    for (i; i < n; i++) {
        let char = statement.Statement?.charAt(i);
        let param = parameters[j];
        if (char === "?") {
            if (param.S) {
                res += param.S;
            } else if (param.BOOL) {
                res += param.BOOL;
            } else if (param.NULL) {
                res += param.NULL;
            } else if (param.N) {
                res += param.N;
            }
            j++;
        }
        else {
            res += char;
        }
    }
    return res;
}

// The parti-ql statements with INSERT keyword in it also contains a json obj inside
export const compileInsertionStatement = (statement: ParameterizedStatement): string => {
    let res = "";
    let n = statement.Statement ? statement.Statement.length : 0;
    let j = 0;
    let parameters = statement.Parameters ? statement.Parameters : [];

    let i = 0;
    for (i; i < n; i++) {
        let char = statement.Statement?.charAt(i);
        let param = parameters[j];

        if (char === "?") {
            if (param.S) {
                res += param.S;
            } else if (param.BOOL) {
                res += param.BOOL;
            } else if (param.NULL) {
                res += param.NULL;
            } else if (param.N) {
                res += param.N;
            }
            j++;
        } else if (char === "'") {
            res += '"';
        } else if (char === ":") {
            res += ': "';
        } else if (char === ",") {
            res += '",'
        } else if (char === "}") {
            let lastOccurrence = findLastOccurrence(res, '\n')
            res = res.substring(0, lastOccurrence);
            res += '"\n}';
        }
        else if (char === " ") {
            continue;
        }
        else {
            res += char;
        }
    }
    return res;
}

export const toJson = (statement: ParameterizedStatement): any => {
    let strStatement = compileInsertionStatement(statement);
    let start = strStatement.indexOf("{");
    let remainder = strStatement.substring(start);
    return JSON.parse(remainder);
}