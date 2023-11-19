jest.mock('aws-amplify', () => ({
    ...jest.requireActual('aws-amplify'),
    configure: jest.fn(),
}));

const mockUsePathname = jest.fn();
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => {
        return {
            prefetch: () => null,
            push: mockPush,
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