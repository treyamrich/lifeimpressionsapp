/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SelectField,
  SwitchField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { createTShirt } from "../graphql/mutations";
const client = generateClient();
export default function TShirtCreateForm(props) {
  const {
    clearOnSuccess = true,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    styleNumber: "",
    brand: "",
    color: "",
    size: "",
    type: "",
    quantityOnHand: "",
    isDeleted: false,
    indexField: "",
  };
  const [styleNumber, setStyleNumber] = React.useState(
    initialValues.styleNumber
  );
  const [brand, setBrand] = React.useState(initialValues.brand);
  const [color, setColor] = React.useState(initialValues.color);
  const [size, setSize] = React.useState(initialValues.size);
  const [type, setType] = React.useState(initialValues.type);
  const [quantityOnHand, setQuantityOnHand] = React.useState(
    initialValues.quantityOnHand
  );
  const [isDeleted, setIsDeleted] = React.useState(initialValues.isDeleted);
  const [indexField, setIndexField] = React.useState(initialValues.indexField);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    setStyleNumber(initialValues.styleNumber);
    setBrand(initialValues.brand);
    setColor(initialValues.color);
    setSize(initialValues.size);
    setType(initialValues.type);
    setQuantityOnHand(initialValues.quantityOnHand);
    setIsDeleted(initialValues.isDeleted);
    setIndexField(initialValues.indexField);
    setErrors({});
  };
  const validations = {
    styleNumber: [{ type: "Required" }],
    brand: [{ type: "Required" }],
    color: [{ type: "Required" }],
    size: [{ type: "Required" }],
    type: [{ type: "Required" }],
    quantityOnHand: [{ type: "Required" }],
    isDeleted: [],
    indexField: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          styleNumber,
          brand,
          color,
          size,
          type,
          quantityOnHand,
          isDeleted,
          indexField,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: createTShirt.replaceAll("__typename", ""),
            variables: {
              input: {
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
          if (clearOnSuccess) {
            resetStateValues();
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "TShirtCreateForm")}
      {...rest}
    >
      <TextField
        label="Style number"
        isRequired={true}
        isReadOnly={false}
        value={styleNumber}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              styleNumber: value,
              brand,
              color,
              size,
              type,
              quantityOnHand,
              isDeleted,
              indexField,
            };
            const result = onChange(modelFields);
            value = result?.styleNumber ?? value;
          }
          if (errors.styleNumber?.hasError) {
            runValidationTasks("styleNumber", value);
          }
          setStyleNumber(value);
        }}
        onBlur={() => runValidationTasks("styleNumber", styleNumber)}
        errorMessage={errors.styleNumber?.errorMessage}
        hasError={errors.styleNumber?.hasError}
        {...getOverrideProps(overrides, "styleNumber")}
      ></TextField>
      <TextField
        label="Brand"
        isRequired={true}
        isReadOnly={false}
        value={brand}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              styleNumber,
              brand: value,
              color,
              size,
              type,
              quantityOnHand,
              isDeleted,
              indexField,
            };
            const result = onChange(modelFields);
            value = result?.brand ?? value;
          }
          if (errors.brand?.hasError) {
            runValidationTasks("brand", value);
          }
          setBrand(value);
        }}
        onBlur={() => runValidationTasks("brand", brand)}
        errorMessage={errors.brand?.errorMessage}
        hasError={errors.brand?.hasError}
        {...getOverrideProps(overrides, "brand")}
      ></TextField>
      <TextField
        label="Color"
        isRequired={true}
        isReadOnly={false}
        value={color}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              styleNumber,
              brand,
              color: value,
              size,
              type,
              quantityOnHand,
              isDeleted,
              indexField,
            };
            const result = onChange(modelFields);
            value = result?.color ?? value;
          }
          if (errors.color?.hasError) {
            runValidationTasks("color", value);
          }
          setColor(value);
        }}
        onBlur={() => runValidationTasks("color", color)}
        errorMessage={errors.color?.errorMessage}
        hasError={errors.color?.hasError}
        {...getOverrideProps(overrides, "color")}
      ></TextField>
      <SelectField
        label="Size"
        placeholder="Please select an option"
        isDisabled={false}
        value={size}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              styleNumber,
              brand,
              color,
              size: value,
              type,
              quantityOnHand,
              isDeleted,
              indexField,
            };
            const result = onChange(modelFields);
            value = result?.size ?? value;
          }
          if (errors.size?.hasError) {
            runValidationTasks("size", value);
          }
          setSize(value);
        }}
        onBlur={() => runValidationTasks("size", size)}
        errorMessage={errors.size?.errorMessage}
        hasError={errors.size?.hasError}
        {...getOverrideProps(overrides, "size")}
      >
        <option
          children="Nb"
          value="NB"
          {...getOverrideProps(overrides, "sizeoption0")}
        ></option>
        <option
          children="Six months"
          value="SixMonths"
          {...getOverrideProps(overrides, "sizeoption1")}
        ></option>
        <option
          children="Twelve months"
          value="TwelveMonths"
          {...getOverrideProps(overrides, "sizeoption2")}
        ></option>
        <option
          children="Eighteen months"
          value="EighteenMonths"
          {...getOverrideProps(overrides, "sizeoption3")}
        ></option>
        <option
          children="Twenty four months"
          value="TwentyFourMonths"
          {...getOverrideProps(overrides, "sizeoption4")}
        ></option>
        <option
          children="Two t"
          value="TwoT"
          {...getOverrideProps(overrides, "sizeoption5")}
        ></option>
        <option
          children="Three t"
          value="ThreeT"
          {...getOverrideProps(overrides, "sizeoption6")}
        ></option>
        <option
          children="Four t"
          value="FourT"
          {...getOverrideProps(overrides, "sizeoption7")}
        ></option>
        <option
          children="Five to six t"
          value="FiveToSixT"
          {...getOverrideProps(overrides, "sizeoption8")}
        ></option>
        <option
          children="Yxs"
          value="YXS"
          {...getOverrideProps(overrides, "sizeoption9")}
        ></option>
        <option
          children="Ys"
          value="YS"
          {...getOverrideProps(overrides, "sizeoption10")}
        ></option>
        <option
          children="Ym"
          value="YM"
          {...getOverrideProps(overrides, "sizeoption11")}
        ></option>
        <option
          children="Yl"
          value="YL"
          {...getOverrideProps(overrides, "sizeoption12")}
        ></option>
        <option
          children="Yxl"
          value="YXL"
          {...getOverrideProps(overrides, "sizeoption13")}
        ></option>
        <option
          children="Axs"
          value="AXS"
          {...getOverrideProps(overrides, "sizeoption14")}
        ></option>
        <option
          children="As"
          value="AS"
          {...getOverrideProps(overrides, "sizeoption15")}
        ></option>
        <option
          children="Am"
          value="AM"
          {...getOverrideProps(overrides, "sizeoption16")}
        ></option>
        <option
          children="Al"
          value="AL"
          {...getOverrideProps(overrides, "sizeoption17")}
        ></option>
        <option
          children="Axl"
          value="AXL"
          {...getOverrideProps(overrides, "sizeoption18")}
        ></option>
        <option
          children="Two x"
          value="TwoX"
          {...getOverrideProps(overrides, "sizeoption19")}
        ></option>
        <option
          children="Three x"
          value="ThreeX"
          {...getOverrideProps(overrides, "sizeoption20")}
        ></option>
        <option
          children="Four x"
          value="FourX"
          {...getOverrideProps(overrides, "sizeoption21")}
        ></option>
        <option
          children="Five x"
          value="FiveX"
          {...getOverrideProps(overrides, "sizeoption22")}
        ></option>
      </SelectField>
      <SelectField
        label="Type"
        placeholder="Please select an option"
        isDisabled={false}
        value={type}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              styleNumber,
              brand,
              color,
              size,
              type: value,
              quantityOnHand,
              isDeleted,
              indexField,
            };
            const result = onChange(modelFields);
            value = result?.type ?? value;
          }
          if (errors.type?.hasError) {
            runValidationTasks("type", value);
          }
          setType(value);
        }}
        onBlur={() => runValidationTasks("type", type)}
        errorMessage={errors.type?.errorMessage}
        hasError={errors.type?.hasError}
        {...getOverrideProps(overrides, "type")}
      >
        <option
          children="Cotton"
          value="Cotton"
          {...getOverrideProps(overrides, "typeoption0")}
        ></option>
        <option
          children="Drifit"
          value="Drifit"
          {...getOverrideProps(overrides, "typeoption1")}
        ></option>
        <option
          children="Blend"
          value="Blend"
          {...getOverrideProps(overrides, "typeoption2")}
        ></option>
      </SelectField>
      <TextField
        label="Quantity on hand"
        isRequired={true}
        isReadOnly={false}
        type="number"
        step="any"
        value={quantityOnHand}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              styleNumber,
              brand,
              color,
              size,
              type,
              quantityOnHand: value,
              isDeleted,
              indexField,
            };
            const result = onChange(modelFields);
            value = result?.quantityOnHand ?? value;
          }
          if (errors.quantityOnHand?.hasError) {
            runValidationTasks("quantityOnHand", value);
          }
          setQuantityOnHand(value);
        }}
        onBlur={() => runValidationTasks("quantityOnHand", quantityOnHand)}
        errorMessage={errors.quantityOnHand?.errorMessage}
        hasError={errors.quantityOnHand?.hasError}
        {...getOverrideProps(overrides, "quantityOnHand")}
      ></TextField>
      <SwitchField
        label="Is deleted"
        defaultChecked={false}
        isDisabled={false}
        isChecked={isDeleted}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              styleNumber,
              brand,
              color,
              size,
              type,
              quantityOnHand,
              isDeleted: value,
              indexField,
            };
            const result = onChange(modelFields);
            value = result?.isDeleted ?? value;
          }
          if (errors.isDeleted?.hasError) {
            runValidationTasks("isDeleted", value);
          }
          setIsDeleted(value);
        }}
        onBlur={() => runValidationTasks("isDeleted", isDeleted)}
        errorMessage={errors.isDeleted?.errorMessage}
        hasError={errors.isDeleted?.hasError}
        {...getOverrideProps(overrides, "isDeleted")}
      ></SwitchField>
      <TextField
        label="Index field"
        isRequired={false}
        isReadOnly={false}
        value={indexField}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              styleNumber,
              brand,
              color,
              size,
              type,
              quantityOnHand,
              isDeleted,
              indexField: value,
            };
            const result = onChange(modelFields);
            value = result?.indexField ?? value;
          }
          if (errors.indexField?.hasError) {
            runValidationTasks("indexField", value);
          }
          setIndexField(value);
        }}
        onBlur={() => runValidationTasks("indexField", indexField)}
        errorMessage={errors.indexField?.errorMessage}
        hasError={errors.indexField?.hasError}
        {...getOverrideProps(overrides, "indexField")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Clear"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          {...getOverrideProps(overrides, "ClearButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={Object.values(errors).some((e) => e?.hasError)}
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
