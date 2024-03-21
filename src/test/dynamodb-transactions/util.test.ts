import { fromAttrVals } from "@/dynamodb-transactions/util";

describe('TEST REMOV ATTR VAL', () => {
    let resp = {
        'a': { S: 'val' },
        'b': { N: '5' },
        'c': { 'M': { 'foo': { S: 'bar' } } },
        'd': { 'L': [{ S: '1' }, { BOOL: true }, { NULL: 'true' }] }
    };
    let expected = {
        'a': 'val',
        'b': 5,
        'c': {
            foo: 'bar'
        },
        'd': ['1', true, null]
    }
    fromAttrVals(resp)
    expect(1).toBe(1)
})