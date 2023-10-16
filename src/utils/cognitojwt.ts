import { CognitoUser } from '@aws-amplify/auth';
import { CognitoUserSession } from 'amazon-cognito-identity-js';

export const extractJWT = (user: CognitoUser) => {
    const session: CognitoUserSession | null = user.getSignInUserSession();
    return session !== null ? session.getIdToken().getJwtToken() : "";
}