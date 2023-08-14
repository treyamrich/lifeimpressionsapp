"use client";

import { useAuthContext } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth, Hub } from 'aws-amplify';

type PathProps = {
    children?: ReactElement,
    unprotectedRoutes?: string[]
}

const isProtectedRoute = (currRoute: string, unprotectedRoutes?: string[]) => {
    let isProtectedRoute = true;
    unprotectedRoutes?.forEach(route => {
        if(currRoute.includes(route)) isProtectedRoute = false
    });
    return isProtectedRoute;
}

const ProtectedRoute = ( { children, unprotectedRoutes } : PathProps ) => {
  const { setUser, login } = useAuthContext();
  const pathName = usePathname();
  const router = useRouter();

  useEffect(()=> {
    checkUser();
  }, []);
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data }}) => {
      switch (event) {
        case "cognitoHostedUI":
        case "signIn":
          router.push("/");
          checkUser();
          break;
      }
      //Retry login
      if(event.includes("_failure")) {
        router.push("/authentication/login/failure");
      }
    });
    checkUser();
    return unsubscribe;
  }, []);

  const checkUser = async (): Promise<void> => {
    try {
      const userData = await Auth.currentAuthenticatedUser();
      setUser(userData);
    } catch(error) {
      setUser(null);
      if(isProtectedRoute(pathName, unprotectedRoutes)) {
        router.push('/authentication/login')
      }
    }
  };

  return (
    <> {children} </>
  )
  
}

export default ProtectedRoute