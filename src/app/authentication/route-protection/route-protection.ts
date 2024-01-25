const unprotectedRoutes = [
  '/authentication/login',
  '/authentication/register',
  '/authentication/register/confirm',
  '/authentication/forgot',
  '/authentication/forgot/confirm',
  '/unauthorized'
];

export const isProtectedRoute = (currRoute: string) => {
  let isProtectedRoute = true;
  unprotectedRoutes.forEach(route => {
      if(currRoute.includes(route)) isProtectedRoute = false
  });
  return isProtectedRoute;
}