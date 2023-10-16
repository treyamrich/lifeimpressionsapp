"use client";

import { ReactNode, useState, Dispatch, createContext, useContext, SetStateAction } from "react";
import { Auth } from "aws-amplify";
import { CognitoUser } from '@aws-amplify/auth';
import { useRouter } from "next/navigation";

type authContextType = {
  user: any;
  setUser: Dispatch<SetStateAction<CognitoUser | null>>;
  login: (creds: LoginCredentials) => void;
  logout: () => void;
  register: (creds: RegisterCredentials) => void;
  confirmRegister: (input: ConfirmRegisterInput) => void;
  authError: AuthError,
  setAuthError: Dispatch<SetStateAction<AuthError>>;
  forgotPassword: (username: string) => void;
  forgotPasswordSubmit: (input: ForgotPasswordInput) => void;
};

const authContextDefaultValues: authContextType = {
  user: null,
  setUser: () => { },
  login: () => { },
  logout: () => { },
  register: () => { },
  confirmRegister: () => { },
  authError: { errMsg: "" },
  setAuthError: () => { },
  forgotPassword: () => { },
  forgotPasswordSubmit: () => { }
};

const AuthContext = createContext<authContextType>(authContextDefaultValues);
export const useAuthContext = () => useContext(AuthContext);

type Props = {
  children: ReactNode;
};

export type LoginCredentials = {
  username: string;
  password: string;
}

export type RegisterCredentials = {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
}

export type ConfirmRegisterInput = {
  username: string;
  confirmationCode: string;
}

export type ForgotPasswordInput = {
  username: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type AuthError = {
  errMsg: string
}

export const AuthContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [authError, setAuthError] = useState<AuthError>({ errMsg: "" });
  const router = useRouter();

  // NOTE: Using a listener in ProtectedRoute.tsx to detect auth events
  const login = async (creds: LoginCredentials) => {
    const { username, password } = creds;
    await Auth.signIn(username, password)
      .catch(e => {
        setAuthError({ errMsg: "Invalid Credentials" })
      });
  }
  const logout = async () => {
    await Auth.signOut()
      .then(() => router.push('/authentication/login'))
      .catch(e => console.log('Error signing out:', e));
  }

  const register = async (creds: RegisterCredentials) => {
    const { username, password, confirmPassword, name, email } = creds;
    if (confirmPassword != password) {
      setAuthError({ errMsg: "Passwords do not match" });
      return;
    }
    await Auth.signUp({
      username,
      password,
      attributes: {
        name,
        email
      }
    })
      .then(() => router.push(`/authentication/register/confirm/${encodeURIComponent(username)}`))
      .catch(e => {
        setAuthError({ errMsg: e.message })
      })
  }

  const confirmRegister = async (input: ConfirmRegisterInput) => {
    const { username, confirmationCode } = input;
    await Auth.confirmSignUp(
      username,
      confirmationCode
    )
      .then(() => router.push('/'))
      .catch(e => setAuthError({ errMsg: e.message }))
  }

  const forgotPasswordSubmit = async (input: ForgotPasswordInput) => {
    const { username, newPassword, confirmNewPassword, code } = input;
    if (confirmNewPassword !== newPassword) {
      setAuthError({ errMsg: "Passwords do not match" });
      return;
    }
    await Auth.forgotPasswordSubmit(username, code, newPassword)
      .then(() => router.push('/authentication/login'))
      .catch(e => setAuthError({ errMsg: e.message }));
  }
  const forgotPassword = async (username: string) => {
    await Auth.forgotPassword(username)
      .then(() => router.push(`/authentication/forgot/confirm/${encodeURIComponent(username)}`))
      .catch(e => setAuthError({ errMsg: e.message }))
  }

  const value = {
    user,
    setUser,
    login,
    logout,
    register,
    confirmRegister,
    authError,
    setAuthError,
    forgotPassword,
    forgotPasswordSubmit
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
