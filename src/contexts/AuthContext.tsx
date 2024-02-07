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
import { Button, CircularProgress } from "@mui/material";

type authContextType = {
  user: any;
  setUser: Dispatch<SetStateAction<CognitoUser | null>>;

  refreshSession: () => Promise<any | undefined>;
  login: (creds: LoginCredentials) => void;
  logout: () => void;

  register: (creds: RegisterCredentials) => void;
  confirmRegister: (input: ConfirmRegisterInput) => void;

  authError: AuthError,
  setAuthError: Dispatch<SetStateAction<AuthError>>;

  forgotPassword: (username: string) => void;
  forgotPasswordSubmit: (input: ForgotPasswordInput) => void;
  completeNewPassword: (newPw: string, name: string) => void;
};

const authContextDefaultValues: authContextType = {
  user: null,
  setUser: () => { },

  refreshSession: () => Promise.resolve(),

  login: () => { },
  logout: () => { },

  register: () => { },
  confirmRegister: () => { },

  authError: { errMsg: "" },
  setAuthError: () => { },

  forgotPassword: () => { },
  forgotPasswordSubmit: () => { },
  completeNewPassword: () => {}
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
export const loginPath = '/authentication/login';
export const registerSuccessPath = '/authentication/register/success';

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
      .then(user => {
        if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          setUser(user);
         router.push('/authentication/complete-new-password');
        }
      })
      .catch(e => {
        setAuthError({ errMsg: "Invalid Credentials" })
      })
  }
  const logout = async () => {
    clearDBOperationErrors();
    // Reset auth errors
    setAuthError({ errMsg: "" });

    await Auth.signOut()
      .then(() => {
        router.push(loginPath);
      })
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
      .then(() => router.push(registerSuccessPath))
      .catch(e => setAuthError({ errMsg: e.message }))
  }

  const forgotPasswordSubmit = async (input: ForgotPasswordInput) => {
    const { username, newPassword, confirmNewPassword, code } = input;
    if (confirmNewPassword !== newPassword) {
      setAuthError({ errMsg: "Passwords do not match" });
      return;
    }
    await Auth.forgotPasswordSubmit(username, code, newPassword)
      .then(() => router.push(loginPath))
      .catch(e => setAuthError({ errMsg: e.message }));
  }
  const forgotPassword = async (username: string) => {
    await Auth.forgotPassword(username)
      .then(() => router.push(`/authentication/forgot/confirm/${encodeURIComponent(username)}`))
      .catch(e => setAuthError({ errMsg: e.message }))
  }

  const completeNewPassword = async (newPw: string, name: string) => {
    if(!user) return;

    const requiredAttributes = { name: name }
    Auth.completeNewPassword(user, newPw, requiredAttributes)
    .catch(e => {
      setAuthError({ errMsg: e.message});
    })
  }

  const checkUser = async (): Promise<any | undefined> => {
    try {
      let userData = await Auth.currentAuthenticatedUser();
      const groups = userData.signInUserSession.accessToken.payload["cognito:groups"];
      // Is User is not admin
      if (!groups || !groups.includes("admin")) {
        userData = null;
      }
      setUser(userData);
      return userData
    } catch (error: any) {
      setUser(null);
      // No user
      if (routeIsProtected) {
        router.push(loginPath);
      }
    }
  };

  // Set user on initial load
  useEffect(() => {
    checkUser();
  }, []);

  // Refresh session token every 59 minutes
  useEffect(() => {
    const checkUserInterval = setInterval(() => {
      checkUser();
    }, EVERY_59_MIN_AS_MS);
    return () => clearInterval(checkUserInterval);
  }, []);

  // Set the user after login events
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      //console.log(`auth event: ${event} ${data}`)
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

  // authorization is not used in this app since sign up is disabled
  const unauthorized = (
    <> User not authorized: <Button
          color="error"
          size="small"
          variant="contained"
          onClick={logout}>
          Logout
        </Button></>
  );

  const showRoute = user !== null || !routeIsProtected;
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,

        refreshSession: checkUser,

        login,
        logout,

        register,
        confirmRegister,

        authError,
        setAuthError,

        forgotPassword,
        forgotPasswordSubmit,
        completeNewPassword
      }}>
      {showRoute ? <> {children} </> : <CircularProgress />}
    </AuthContext.Provider>
  );
};
