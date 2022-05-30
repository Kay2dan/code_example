import React, { PropsWithoutRef } from "react";
import { useFormContext } from "react-hook-form";

export interface LabeledSelectProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string;
  label: string;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
}

export const LabeledRadioButton = React.forwardRef<
  HTMLInputElement,
  LabeledSelectProps
>(({ outerProps, label, ...props }, ref) => {
  const {
    register,
    formState: { isSubmitting, errors },
  } = useFormContext();
  const error = Array.isArray(errors[props.name])
    ? errors[props.name].join(", ")
    : errors[props.name]?.message || errors[props.name];
  return (
    <div className="" {...outerProps}>
      <div>
        <div className="optionWrapper">
          <label htmlFor={props.name} className="checkbox">
            <input
              type="checkbox"
              id={props.name}
              disabled={isSubmitting}
              {...props}
              {...register(props.name)}
              // ref={register}
            />
            {` ${label}`}
          </label>
        </div>
      </div>
      {error && (
        <div role="alert" style={{ color: "#f78e69" }}>
          {error}
        </div>
      )}
    </div>
  );
});

export default LabeledRadioButton;
