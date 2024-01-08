"use client";

import {
  ReactNode,
  useState,
  Dispatch,
  createContext,
  useContext,
  SetStateAction,
  useEffect
} from "react";
import { Auth, Hub } from "aws-amplify";
import { CognitoUser } from '@aws-amplify/auth';
import { usePathname, useRouter } from "next/navigation";
import { isProtectedRoute } from "@/app/authentication/route-protection/route-protection";
import { useDBOperationContext } from "./DBErrorContext";

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

const EVERY_59_MIN_AS_MS = 3540000;

export const AuthContextProvider = ({ children }: Props) => {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [authError, setAuthError] = useState<AuthError>({ errMsg: "" });
  const router = useRouter();
  const pathName = usePathname();
  const routeIsProtected = isProtectedRoute(pathName);
  const { clearDBOperationErrors } = useDBOperationContext();

  // NOTE: Using a listener in ProtectedRoute.tsx to detect auth events
  const login = async (creds: LoginCredentials) => {
    const { username, password } = creds;
    await Auth.signIn(username, password)
      .catch(e => {
        setAuthError({ errMsg: "Invalid Credentials" })
      })
  }
  const logout = async () => {
    clearDBOperationErrors();
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

  const checkUser = async (): Promise<void> => {
    try {
      const userData = await Auth.currentAuthenticatedUser();
      const groups = userData.signInUserSession.accessToken.payload["cognito:groups"];
      if (!groups || !groups.includes("admin")) {
        router.push('/unauthorized');
        throw Error('User is not admin')
      }
      console.log(userData);
      setUser(userData);
    } catch (error: any) {
      console.log(error)
      setUser(null);
      if (routeIsProtected)
        router.push('/authentication/login');
    }
  };

  // Set user on initial load
  useEffect(() => {
    checkUser();
  }, []);

  // Refresh session token every 59 minutes
  useEffect(() => {
    const checkUserInterval = setInterval(() => {
      console.log("REFRESHING SESSION TOKENS");
      checkUser();
    }, EVERY_59_MIN_AS_MS);
    return () => clearInterval(checkUserInterval);
  }, []);

  // Set the user after login events
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      console.log(`auth event: ${event}`)
      switch (event) {
        case "cognitoHostedUI":
        case "signIn":
          router.push("/");
          checkUser();
          break;
      }
    });
    return unsubscribe;
  }, []);

  const showRoute = user !== null || !routeIsProtected;
  return (
    <AuthContext.Provider
      value={{
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
      }}>
      {showRoute ? <> {children} </> : <></>}
    </AuthContext.Provider>
  );
};
