import json

def build_event(
    method: str,
    path: str,
    query_params: dict,
    body: str,
    headers: dict,
) -> dict:
    event_template = '''
    {{
        "body": {body},
        "resource": "/{{proxy+}}",
        "requestContext": {{
            "resourceId": "123456",
            "apiId": "1234567890",
            "resourcePath": "/{{proxy+}}",
            "httpMethod": "{method}",
            "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
            "accountId": "123456789012",
            "identity": {{
                "apiKey": "",
                "userArn": "",
                "cognitoAuthenticationType": "",
                "caller": "",
                "userAgent": "mac",
                "user": "",
                "cognitoIdentityPoolId": "",
                "cognitoIdentityId": "",
                "cognitoAuthenticationProvider": "",
                "sourceIp": "127.0.0.1",
                "accountId": ""
            }},
            "stage": "prod"
        }},
        "queryStringParameters": {query_params},
        "headers": {headers},
        "pathParameters": "null",
        "httpMethod": "{method}",
        "stageVariables": "null",
        "path": "{path}"
    }}
    '''
    
    event_json = event_template.format(
        body=json.dumps(body),
        method=method,
        query_params=json.dumps(query_params),
        headers=json.dumps(headers),
        path=path
    )
    return json.loads(event_json)