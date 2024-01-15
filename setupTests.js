// jest.mock('aws-amplify', () => ({
//     ...jest.requireActual('aws-amplify')
// }));
import { Amplify } from "aws-amplify"
import awsConfig from "./src/aws-exports";
Amplify.configure({ ...awsConfig, ssr: true });

export const mockUsePathname = jest.fn();
export const mockNextRouterPush = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => {
        return {
            prefetch: () => null,
            push: mockNextRouterPush,
        };
    },
    usePathname() {
        return mockUsePathname();
    },
}));

export const mockIsProtectedRoute = jest.fn();
jest.mock('@/app/authentication/route-protection/route-protection.ts', () => ({
    ...jest.requireActual('@/app/authentication/route-protection/route-protection.ts'),
    //isProtectedRoute: () => mockIsProtectedRoute()
    isProtectedRoute: mockIsProtectedRoute,
}));