import {
  act,
  fireEvent,
  prettyDOM,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderWithProviders } from "@/test/util/render";

import {
  validCreateTShirtInput,
  validCreateTShirtInputResponse,
  tshirt,
  invalidCreateTShirtInput,
  expectedErrsForInvalidInput,
  ExpectedErrorMessage,
  createTShirtInputDuplicate,
  expectedErrsDuplicate,
} from "./inventory.fixtures";
import Inventory from "@/app/(DashboardLayout)/inventory/page";
import { listTShirtAPI } from "@/graphql-helpers/list-apis";
import { CreateTShirtInput } from "@/API";
import { createTShirtAPI } from "@/graphql-helpers/create-apis";

jest.mock("@/graphql-helpers/list-apis", () => ({
  listTShirtAPI: jest.fn().mockResolvedValue([tshirt]),
}));

const assertEqualTShirtInputs = (
  tshirtInput: CreateTShirtInput,
  expectedInput: CreateTShirtInput
) => {
  Object.keys(tshirt).forEach((key: string) =>
    expect(tshirtInput[key as keyof CreateTShirtInput]).toBe(
      expectedInput[key as keyof CreateTShirtInput]?.toString()
    )
  );
};

jest.mock("@/graphql-helpers/create-apis", () => ({
  createTShirtAPI: jest.fn().mockImplementation((tshirt: CreateTShirtInput) => {
    assertEqualTShirtInputs(tshirt, validCreateTShirtInput);
    return validCreateTShirtInputResponse;
  }),
}));

const insertValues = (createInput: CreateTShirtInput) => {
  const inputNames = [
    "styleNumber",
    "quantityOnHand",
    "brand",
    "color",
    "size",
    "type",
  ];
  const stackNode = screen.getByTestId("create-tshirt-inputs");
  inputNames.forEach((inputName) => {
    const input = stackNode.querySelector(
      `input[name="${inputName}`
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: {
        value: createInput[inputName as keyof CreateTShirtInput],
      },
    });
  });
};

const renderAndOpenCreateModal = async () => {
  await act(() => renderWithProviders(<Inventory />));
  const openCreateButton = screen.getByText("Add New Item");
  fireEvent.click(openCreateButton);
};

const clickSubmitCreateModal = () => {
  const submitButton = screen.getAllByText("Create New TShirt")[1];
  fireEvent.click(submitButton);
};

describe("Inventory", () => {
  afterEach(jest.clearAllMocks);

  describe("List TShirts", () => {
    it("should display non-deleted tshirts", async () => {
      await act(() => renderWithProviders(<Inventory />));
      const expectedElements = [
        screen.getByText("123"),
        screen.getByText("Red"),
      ];
      expectedElements.forEach((elm) => expect(elm).toBeInTheDocument());
      expect(listTShirtAPI).toHaveBeenCalledWith({ isDeleted: { ne: true } });
      expect(listTShirtAPI).toHaveBeenCalledTimes(1);
    });
    it("should display a message when no shirts are received", async () => {
      (listTShirtAPI as jest.Mock).mockResolvedValueOnce([]);
      await act(() => renderWithProviders(<Inventory />));
      const expectedElements = [screen.getByText("No records to display")];
      expectedElements.forEach((elm) => expect(elm).toBeInTheDocument());
      expect(listTShirtAPI).toHaveBeenCalledTimes(1);
    });
  });

  describe("Create TShirt", () => {
    it("should open the CreateTShirtModal component", async () => {
      await act(() => renderWithProviders(<Inventory />));

      expect(screen.queryByRole("dialog")).toBeNull();
      const openCreateButton = screen.getByText("Add New Item");
      fireEvent.click(openCreateButton);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      const createModalHeader = screen.getAllByText("Create New TShirt")[0];
      expect(createModalHeader).toBeInTheDocument();
    });

    it("should call the create tshirt api on submit", async () => {
      await renderAndOpenCreateModal();

      insertValues(validCreateTShirtInput);
      clickSubmitCreateModal();

      waitFor(() => {
        const dialog = screen.queryByRole("dialog");
        expect(dialog).toBeNull();
      });

      expect(createTShirtAPI).toHaveBeenCalledTimes(1);
    });

    it("should display the respective error when invalid values input into form, and should clear errors after some or all valid inputs are entered", async () => {
      await renderAndOpenCreateModal();
      insertValues(invalidCreateTShirtInput);
      clickSubmitCreateModal();

      expectedErrsForInvalidInput.forEach((err: ExpectedErrorMessage) => {
        const errText = screen.getAllByText(err.message);
        expect(errText.length).toBe(err.times);
      });

      insertValues({ ...invalidCreateTShirtInput, brand: "Some valid brand" });
      clickSubmitCreateModal();

      const errText = screen.getAllByText("Field is required");
      expect(errText.length).toBe(2);
    });

    it("should display an error when a duplicate tshirt will be inserted", async () => {
      await renderAndOpenCreateModal();
      insertValues(createTShirtInputDuplicate);
      clickSubmitCreateModal();

      const errText = screen.getAllByText(expectedErrsDuplicate.message);
      expect(errText.length).toBe(expectedErrsDuplicate.times);
    });
  });
});
