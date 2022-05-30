import { FC, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSetRecoilState } from "recoil";
import {
  // DueCalendarField,
  GoalFormSwitch,
  GoalTaskForm,
  GoalChoreFormDeleteBox,
  LabeledTextArea,
} from "app/components";
import { overlaySt } from "app/state";
import { iconBin } from "app/utilities/data_svgs_new";

let tErrTxt =
  "Tasks should be between 3 & 50 characters. Please check task number";
export interface GoalFormFCPropTypes {
  item: any;
  index: number;
  teamStartDate: Date | undefined;
  removeGoalForm: (index: number) => void;
}

/*******************************
 * *****************************
 * GoalForm for each goal
 *******************************
 ******************************/
const GoalForm: FC<GoalFormFCPropTypes> = ({
  item,
  index,
  teamStartDate,
  removeGoalForm,
}) => {
  const {
    formState: { errors },
    register,
    setFocus,
  } = useFormContext();
  const setOverlay = useSetRecoilState(overlaySt);
  const [showConfirmBoxPreDelete, setShowConfirmBoxPreDelete] = useState(false);
  const goalErr = errors?.goals?.[index];
  // console.log("goalErr: ", index, errors.goals);

  useEffect(() => {
    if (item.title.length === 0) {
      setFocus(`goals[${index}].title`);
    }
  }, [item.title, setFocus, index]);

  const deleteClickHandler = () => {
    window.scrollTo(0, 0);
    setOverlay(["empty", "", () => setShowConfirmBoxPreDelete(false)]);
    setShowConfirmBoxPreDelete(true);
  };

  return (
    <div className="goalBox" key={item.id}>
      <h3 className="text-glossyGrape text-center mt-2 mb-6">{`Goal No. ${
        index + 1
      }`}</h3>
      <div className="pseudoBorder flex flex-col sm:flex-row items-baseline w-12/12 px-4 lg:px-6 pb-2 mb-5">
        <label htmlFor="title" className="label">
          <span>title: </span>
          <span className="req">*</span>
        </label>
        <div className="flex flex-row w-full">
          <input
            id="title"
            type="text"
            minLength={3}
            maxLength={50}
            defaultValue={item.title}
            placeholder={`[required] What is the goal heading? Max. 50 characters.`}
            className="h-7 font-sans font-semibold text-vividTangerine placeholder-gray-lighter text-xxs sm:text-xs xl:text-base inline-block bg-transparent"
            {...register(`goals.${index}.title`)}
          />
          <GoalFormSwitch index={index} />
        </div>
      </div>
      <LabeledTextArea
        label="Intro:"
        maxLength={250}
        defaultValue={item.intro}
        name={`goals.${index}.intro`}
        placeholder={`[optional] Why is this goal important to you?`}
        labelClasses="label"
        textareaClasses="inline-block text-xxs sm:text-xs xl:text-base text-gray placeholder-gray-lighter bg-transparent resize-none border-none p-0 pr-8"
        outerProps={{
          className: "pseudoBorder w-12/12 px-4 lg:px-6 pb-2 mt-5",
        }}
      />
      {/* <DueCalendarField
        currentVal={item.deadline}
        labels={["Deadline", `[optional] When is it due by?`]}
        teamStartDate={teamStartDate}
        name={`goals.${index}.deadline`}
      /> */}
      <GoalTaskForm index={index} fieldArrayName={`goals.${index}.task`} />
      <div className="goalBoxIconBin" onClick={deleteClickHandler}>
        <svg viewBox={iconBin.viewbox} className="">
          {iconBin.paths.map((p, i) => (
            <path d={p.d} className={`fill-${p.className}`} key={i} />
          ))}
        </svg>
      </div>
      {showConfirmBoxPreDelete && (
        <GoalChoreFormDeleteBox
          index={index}
          removeForm={removeGoalForm}
          setShowConfirmBoxBeforeDelete={setShowConfirmBoxPreDelete}
        />
      )}
      {/* Disabling the errors because of bugs */}
      <GoalFormError errState={goalErr} />
    </div>
  );
};

/*******************************
 * *****************************
 * Component to render the error state of the GoalForm
 *******************************
 ******************************/
const GoalFormError: FC<any> = ({ errState }) => {
  let tErrStr = `${tErrTxt}: `;
  errState?.task?.length &&
    errState?.task?.forEach((t, i) => {
      if (t?.content) {
        tErrStr = `${tErrStr} ${i + 1},`;
      }
    });
  return (
    <ul className="errParent pr-2 lg:px-6">
      {errState?.title?.message.length ? (
        <li>{`Goal Title ${errState.title?.message.toLowerCase()}`}</li>
      ) : null}
      {errState?.task?.length > 0 ? <li>{`${tErrStr}`}</li> : null}
    </ul>
  );
};

export default GoalForm;
