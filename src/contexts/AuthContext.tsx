import { ReactNode, useState, Dispatch, createContext, useContext, SetStateAction } from "react";
import { Auth } from "aws-amplify";
import { CognitoHostedUIIdentityProvider, CognitoUser } from '@aws-amplify/auth';

type authContextType = {
  user: any;
  setUser: Dispatch<SetStateAction<CognitoUser | null>>;
  login: () => void;
  logout: () => void;
};

const authContextDefaultValues: authContextType = {
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {}
};

const AuthContext = createContext<authContextType>(authContextDefaultValues);
export const useAuthContext = () => useContext(AuthContext);

type Props = {
  children: ReactNode;
};

export const AuthContextProvider = ({ children } : Props) => {
  const [user, setUser] = useState<CognitoUser | null>(null);

  const login = async () => {
    Auth.federatedSignIn({provider: CognitoHostedUIIdentityProvider.Google })
        .catch(e =>  console.log('Error signing in with Google:', e));
  }
  const logout = async () => {
    await Auth.signOut()
        .catch(e => console.log('Error signing out:', e));
  }

  const value = { 
    user,
    setUser,
    login, 
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
