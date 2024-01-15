// import { fireEvent, render, screen } from '@testing-library/react'
// import Register2 from '../page'
// import { AuthContextProvider } from '@/contexts/AuthContext';
// import { mockIsProtectedRoute } from '../../../../..//setupTests.js';

// const mockRegister = jest.fn();
// jest.mock('@/contexts/AuthContext', () => ({
//     ...jest.requireActual('@/contexts/AuthContext'),
//     useAuthContext: () => ({
//         register: mockRegister,
//     }),
// }));

describe('skipped', ()=> {
    it('should do nothing', () =>{

    });
})
// describe('Register Page', () => {
//     it('should render the input labels and fields', () => {
//         render(<Register2 />)

//         const registerLabels = [
//             'Name',
//             'Email Address',
//             'Password',
//             'Confirm Password',
//             'Sign Up' // button
//         ].map(x => screen.getByText(x))

//         const registerInputs = [
//             'name-input',
//             'email-input',
//             'password-input',
//             'confirm-password-input'
//         ].map(x => screen.getByTestId(x))

//         registerLabels
//             .concat(registerInputs)
//             .forEach(x =>
//                 expect(x).toBeInTheDocument()
//             )
//     })

//     it('should successfully call register with the RegisterCredentials', () => {
//         mockIsProtectedRoute.mockImplementation(() => true)

//         render(
//             <AuthContextProvider>
//                 <Register2 />
//             </AuthContextProvider>
//         );

//         // Perform actions that trigger the onSubmit function
//         fireEvent.click(screen.getByTestId('submit-button'));

//         // Check if the register function is called
//         expect(mockRegister).toHaveBeenCalled();
//     })

//     it('should validate password w/ confirm password on submission', () => {

//     })

//     it('should reset the form after submission', () => {

//     })
// })