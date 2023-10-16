"use client";

import { useAuthContext } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { ReactElement, useEffect, useState } from 'react';
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
  const { setUser, logout } = useAuthContext();
  const pathName = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkUser();
  }, []);
  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data }}) => {
      //console.log(`auth event: ${event}`)
      switch (event) {
        case "cognitoHostedUI":
        case "signIn":
          router.push("/");
          checkUser();
          break;
      }
    });
    checkUser();
    return unsubscribe;
  }, []);

  const checkUser = async (): Promise<void> => {
    try {
      const userData = await Auth.currentAuthenticatedUser();
      const groups = userData.signInUserSession.accessToken.payload["cognito:groups"];
      if(!groups || !groups.includes("admin")) {
        router.push('/unauthorized');
        throw Error('User is not admin')
      }
      setUser(userData);
      setIsLoading(false);
    } catch(error: any) {
      setUser(null);
      if(isProtectedRoute(pathName, unprotectedRoutes)) {
        router.push('/authentication/login')
      }
    }
  };

  if(isLoading && isProtectedRoute(pathName, unprotectedRoutes)) {
    return <></>
  };
  return (
    <> {children} </>
  )
  
}

export default ProtectedRoute