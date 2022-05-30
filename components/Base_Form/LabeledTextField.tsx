import React, { PropsWithoutRef } from "react";
import { useFormContext } from "react-hook-form";

export interface LabeledTextFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string;
  /** Field label. */
  label: string;
  labelClasses?: string;
  inputClasses?: string;
  isDisabled?: boolean;
  placeholder?: string;
  required?: boolean;
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number";
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
}

export const LabeledTextField = React.forwardRef<
  HTMLInputElement,
  LabeledTextFieldProps
>(
  (
    {
      label,
      labelClasses = "",
      inputClasses,
      outerProps,
      isDisabled,
      placeholder,
      required,
      ...props
    },
    ref
  ) => {
    const {
      register,
      formState: { isSubmitting, errors },
    } = useFormContext();
    const error = Array.isArray(errors[props.name])
      ? errors[props.name].join(", ")
      : errors[props.name]?.message || errors[props.name];

    return (
      <div {...outerProps}>
        <label htmlFor={props.name} className={`label ${labelClasses}`}>
          <span>{label}</span>
          {required ? <span className="req">*</span> : null}
        </label>
        {/* <div className="control"> */}
        <input
          className={`${inputClasses}`}
          id={props.name}
          placeholder={placeholder}
          disabled={isSubmitting || isDisabled}
          {...props}
          {...register(props.name)}
          // ref={register}
        />
        {/* </div> */}

        {error && (
          <div role="alert" style={{ color: "#f78e69" }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

export default LabeledTextField;
