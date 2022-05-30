import { forwardRef, PropsWithoutRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
// import { mergeRefs } from "app/utilities/reactHelpers";

export interface TextAreaPropsType
  extends PropsWithoutRef<JSX.IntrinsicElements["textarea"]> {
  name: string;
  label?: string;
  labelClasses?: string;
  textareaLength?: number;
  textareaClasses?: string;
  onSubmitHandler?: (values: any) => void;
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
}

/*********************
 * SO on dynamic height Text-Area:
 * https://github.com/MartinDawson/react-fluid-textarea/blob/master/src/index.js
 * https://stackoverflow.com/a/70544036/434697
 */

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaPropsType>(
  (
    {
      label = "",
      outerProps,
      labelClasses,
      textareaLength = 500,
      textareaClasses = "",
      onSubmitHandler,
      ...props
    },
    ref
  ) => {
    const {
      reset,
      trigger,
      register,
      handleSubmit,
      formState: { isSubmitting, errors },
    } = useFormContext();
    const error = Array.isArray(errors[props.name])
      ? errors[props.name].join(", ")
      : errors[props.name]?.message || errors[props.name];

    useEffect(() => {
      const ele = document.getElementById(props.name);
      ele.style.height = "auto";
      ele.style.height = `${ele.scrollHeight}px`;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onInputChange = () => {
      const ele = document.getElementById(props.name);
      ele.style.height = "auto";
      ele.style.height = `${ele.scrollHeight}px`;
    };

    const onKeyDownHandler = async e => {
      if (e.key === "Enter") {
        e.preventDefault();
        const res: boolean = await trigger(props.name, { shouldFocus: true });
        if (res && onSubmitHandler) {
          handleSubmit(onSubmitHandler)();
          reset();
        }
      }
    };

    return (
      <div id="textareaParent" {...outerProps}>
        <div className="flex flex-col sm:flex-row items-start h-full">
          {(label && (
            <label htmlFor={props.name} className={`${labelClasses}`}>
              {label}
            </label>
          )) ||
            undefined}
          <textarea
            rows={1}
            maxLength={300}
            id={props.name}
            disabled={isSubmitting}
            onInput={onInputChange}
            onKeyDown={onKeyDownHandler}
            className={`h-7 ${textareaClasses}`}
            {...props}
            {...register(props.name)}
            // style={{ height: styleHeight }}
            // ref={mergeRefs(register, refTextArea)}
          />
        </div>

        {error && (
          <div role="alert" style={{ color: "#f78e69" }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

export default TextArea;
