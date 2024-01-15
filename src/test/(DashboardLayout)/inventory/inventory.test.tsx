
import { act, fireEvent, prettyDOM, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from "@/test/util/render";

import { createTShirtInput, createdTShirt, tshirt } from "./inventoryfixtures";
import Inventory from "@/app/(DashboardLayout)/inventory/page";
import { listTShirtAPI } from "@/graphql-helpers/fetch-apis";
import { CreateTShirtInput } from '@/API';
import { createTShirtAPI } from '@/graphql-helpers/create-apis';

jest.mock("@/graphql-helpers/fetch-apis", () => ({
    listTShirtAPI: jest.fn().mockResolvedValue([tshirt])
}));
jest.mock("@/graphql-helpers/create-apis", () => ({
    createTShirtAPI: jest.fn().mockImplementation((tshirt: CreateTShirtInput) => {
        Object.keys(tshirt).forEach((key: string) => expect(tshirt[key as keyof CreateTShirtInput])
            .toBe(createTShirtInput[key as keyof CreateTShirtInput]?.toString())
        )
        return createdTShirt;
    })
}));

describe('Inventory', () => {
    afterEach(jest.clearAllMocks);

    describe('List TShirts', () => {
        it('should display non-deleted tshirts', async () => {
            await act(() => renderWithProviders(<Inventory />));
            const expectedElements = [
                screen.getByText("123"),
                screen.getByText("Red")
            ];
            expectedElements.forEach(elm => expect(elm).toBeInTheDocument())
            expect(listTShirtAPI).toHaveBeenCalledWith({ isDeleted: { ne: true } });
            expect(listTShirtAPI).toHaveBeenCalledTimes(1);
        });
        it('should display a message when no shirts are received', async () => {
            (listTShirtAPI as jest.Mock).mockResolvedValueOnce([]);
            await act(() => renderWithProviders(<Inventory />));
            const expectedElements = [
                screen.getByText("No records to display"),
            ];
            expectedElements.forEach(elm => expect(elm).toBeInTheDocument())
            expect(listTShirtAPI).toHaveBeenCalledTimes(1);
        });
    });

    describe('Create TShirt', () => {
        it('should open the CreateTShirtModal component', async () => {
            await act(() => renderWithProviders(<Inventory />));

            expect(screen.queryByRole('dialog')).toBeNull();
            const openCreateButton = screen.getByText('Add New Item');
            fireEvent.click(openCreateButton)

            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();

            const createModalHeader = screen.getAllByText('Create New TShirt')[0];
            expect(createModalHeader).toBeInTheDocument();
        });
        it('should call the create tshirt api on submit', async () => {
            await act(() => renderWithProviders(<Inventory />));
            const openCreateButton = screen.getByText('Add New Item');
            fireEvent.click(openCreateButton);

            const stackNode = screen.getByTestId("create-tshirt-inputs");

            const styleNumInput = stackNode.querySelector('input[name="styleNumber');
            fireEvent.change(styleNumInput as HTMLElement,
                { target: { value: createTShirtInput.styleNumber } });

            const inputNames = [
                'styleNumber',
                'quantityOnHand',
                'brand',
                'color',
                'size',
                'type',
            ]
            inputNames.forEach(inputName => {
                const input = stackNode.querySelector(`input[name="${inputName}`) as HTMLInputElement;
                fireEvent.change(input,
                    { target: { value: createTShirtInput[inputName as keyof CreateTShirtInput] } });
            })

            const submitButton = screen.getAllByText("Create New TShirt")[1];
            fireEvent.click(submitButton);

            waitFor(() => {
                const dialog = screen.queryByRole('dialog');
                expect(dialog).toBeNull()
            })

            expect(createTShirtAPI).toHaveBeenCalledTimes(1);
        })
    });
})