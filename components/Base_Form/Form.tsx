import React, { useState, ReactNode, PropsWithoutRef, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
// import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type FormProps<FormValues> = {
  /** All your form fields */
  children: ReactNode;
  asyncInitialValues?: any;
  isToBeReset?: string; // to reset on submission?
  /** Text to display in the submit button */
  submitText: string;
  submitOnEnter?: boolean;
  /** Horizontal or vertical layout */
  layout?: "row" | "column";
  btnProps?: string;
  btnClasses?: string;
  onSubmit: (values: FormValues) => Promise<void | OnSubmitResult>;
  // initialValues?: UseFormOptions<FormValues>["defaultValues"];
  initialValues?: any;
  schema?: z.ZodType<any, any>;
} & Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit">;

type OnSubmitResult = {
  FORM_ERROR?: string;
  [prop: string]: any;
};

export const FORM_ERROR = "FORM_ERROR";

export function Form<FormValues extends Record<string, unknown>>({
  btnProps = "",
  btnClasses = "",
  children,
  submitText,
  schema,
  initialValues,
  asyncInitialValues,
  onSubmit,
  isToBeReset,
  layout,
  submitOnEnter = true,
  ...props
}: FormProps<FormValues>) {
  const ctx = useForm<FormValues>({
    mode: "onChange",
    defaultValues: initialValues,
    resolver: schema && zodResolver(schema),
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const { isSubmitting, isValid, errors: formErrs } = ctx.formState;

  // validate values and enable/disable the submit btn
  // eslint-disable-next-line
  useEffect(() => {
    if (isSubmitting || !isValid || !!Object.keys(formErrs).length) {
      setIsDisabled(true);
    } else setIsDisabled(false);
  });

  const btnFieldClasses = `${layout === "row" ? "ml-5" : ""}`;

  const onKeyPressHandler = e => {
    if (e.key === "Enter" && !submitOnEnter) {
      e.preventDefault();
      return;
    }
  };

  const submitHandler = async values => {
    const result = (await onSubmit(values as FormValues)) || {};
    for (const [key, value] of Object.entries(result)) {
      if (key === FORM_ERROR) {
        setFormError(value);
      } else {
        ctx.setError(key as any, {
          type: "submit",
          message: value,
        });
      }
    }
    !!isToBeReset && ctx.reset();
  };

  return (
    <FormProvider {...ctx}>
      <form
        className="form"
        onKeyPress={onKeyPressHandler}
        onSubmit={ctx.handleSubmit(submitHandler)}
        {...props}>
        {children}
        {formError && (
          <div
            className="block bg-oldLace"
            role="alert"
            style={{ color: "darkred" }}>
            {formError}
          </div>
        )}
        <div className={`formBtns ${btnFieldClasses} ${btnProps}`}>
          <button
            className={`btn animCircle ${
              isDisabled ? "off noHover" : ""
            } ${btnClasses}`}
            type="submit"
            disabled={isDisabled}>
            <div>{submitText}</div>
          </button>
        </div>
      </form>
      {/* <DevTool control={ctx.control} placement={"bottom-right"} /> */}
    </FormProvider>
  );
}

export default Form;
