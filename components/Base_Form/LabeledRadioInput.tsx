import React, { PropsWithoutRef } from "react";
import { useFormContext } from "react-hook-form";

export interface LabeledRadioProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  name: string;
  options: string[];
  label: string;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
}

export const LabeledRadioButton = React.forwardRef<
  HTMLInputElement,
  LabeledRadioProps
>(({ outerProps, options, label, ...props }, ref) => {
  const {
    register,
    formState: { isSubmitting, errors },
  } = useFormContext();

  const error = Array.isArray(errors[props.name])
    ? errors[props.name].join(", ")
    : errors[props.name]?.message || errors[props.name];
  return (
    <div className="field" {...outerProps}>
      <div className="control">
        <p className="is-6">{label}</p>
        {options.map((opt, i) => (
          <div className="optionWrapper" key={i}>
            <label htmlFor={opt} className="radio">
              <input
                type="radio"
                id={opt.trim()}
                disabled={isSubmitting}
                value={opt}
                {...props}
                {...register(props.name)}
                // ref={register()}
              />
              {` ${opt}`}
            </label>
          </div>
        ))}
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
