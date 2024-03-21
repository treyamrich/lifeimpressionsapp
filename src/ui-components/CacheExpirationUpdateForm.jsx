/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import { Button, Flex, Grid, TextField } from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { API } from "aws-amplify";
import { getCacheExpiration } from "../graphql/queries";
import { updateCacheExpiration } from "../graphql/mutations";
export default function CacheExpirationUpdateForm(props) {
  const {
    id: idProp,
    cacheExpiration: cacheExpirationModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    id: "",
    earliestExpiredDate: "",
  };
  const [id, setId] = React.useState(initialValues.id);
  const [earliestExpiredDate, setEarliestExpiredDate] = React.useState(
    initialValues.earliestExpiredDate
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = cacheExpirationRecord
      ? { ...initialValues, ...cacheExpirationRecord }
      : initialValues;
    setId(cleanValues.id);
    setEarliestExpiredDate(cleanValues.earliestExpiredDate);
    setErrors({});
  };
  const [cacheExpirationRecord, setCacheExpirationRecord] = React.useState(
    cacheExpirationModelProp
  );
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await API.graphql({
              query: getCacheExpiration.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getCacheExpiration
        : cacheExpirationModelProp;
      setCacheExpirationRecord(record);
    };
    queryData();
  }, [idProp, cacheExpirationModelProp]);
  React.useEffect(resetStateValues, [cacheExpirationRecord]);
  const validations = {
    id: [{ type: "Required" }],
    earliestExpiredDate: [],
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
          id,
          earliestExpiredDate: earliestExpiredDate ?? null,
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
          await API.graphql({
            query: updateCacheExpiration.replaceAll("__typename", ""),
            variables: {
              input: {
                id: cacheExpirationRecord.id,
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "CacheExpirationUpdateForm")}
      {...rest}
    >
      <TextField
        label="Id"
        isRequired={true}
        isReadOnly={true}
        value={id}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              id: value,
              earliestExpiredDate,
            };
            const result = onChange(modelFields);
            value = result?.id ?? value;
          }
          if (errors.id?.hasError) {
            runValidationTasks("id", value);
          }
          setId(value);
        }}
        onBlur={() => runValidationTasks("id", id)}
        errorMessage={errors.id?.errorMessage}
        hasError={errors.id?.hasError}
        {...getOverrideProps(overrides, "id")}
      ></TextField>
      <TextField
        label="Earliest expired date"
        isRequired={false}
        isReadOnly={false}
        value={earliestExpiredDate}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              id,
              earliestExpiredDate: value,
            };
            const result = onChange(modelFields);
            value = result?.earliestExpiredDate ?? value;
          }
          if (errors.earliestExpiredDate?.hasError) {
            runValidationTasks("earliestExpiredDate", value);
          }
          setEarliestExpiredDate(value);
        }}
        onBlur={() =>
          runValidationTasks("earliestExpiredDate", earliestExpiredDate)
        }
        errorMessage={errors.earliestExpiredDate?.errorMessage}
        hasError={errors.earliestExpiredDate?.hasError}
        {...getOverrideProps(overrides, "earliestExpiredDate")}
      ></TextField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || cacheExpirationModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || cacheExpirationModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
