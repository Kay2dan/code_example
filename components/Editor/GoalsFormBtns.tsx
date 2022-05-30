import { FC } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useFormContext } from "react-hook-form";
import { overlaySt, tMGBSt } from "app/state";
import { BtnDefault, Tooltip } from "app/components";
import { iconSave, iconTeamMateSearch } from "app/utilities/data_svgs_new";

/*******************************
 * *****************************
 * Component that renders the buttons for the goals form
 *******************************
 ******************************/
const GoalsFormBtns: FC<{
  areGoalsSavedState: boolean;
  teamStartDate: Date | undefined;
  submitHandler: () => void;
}> = ({ areGoalsSavedState, teamStartDate, submitHandler }) => {
  const tMGB = useRecoilValue(tMGBSt);
  const setOverlayState = useSetRecoilState(overlaySt);
  const teamStatus: boolean = !!tMGB.team?.id || !!teamStartDate;

  let findTMBtnState = "";
  if (teamStatus || !areGoalsSavedState) {
    findTMBtnState = "disabled";
  }

  // text to show in find-a-team-mate btn tooltip
  let tooltipTxt = `Add min. 2 goals, then save, to enable`;
  if (teamStatus) tooltipTxt = `You are already in a team`;

  const InviteOnClickHandler = () => {
    if (findTMBtnState !== "disabled") {
      teamStatus || setOverlayState(["consentForm"]);
    }
  };

  return (
    <div className="mt-auto mb-4">
      <div className="flex justify-end gap-4 lg:gap-6 mt-8">
        <BtnSaveGoals submitHandler={submitHandler} />
        <div>
          <BtnDefault
            id="anFindTMBtn"
            parentClasses={`relative ${findTMBtnState ? "" : "highlight"}`}
            classes={`lg ${findTMBtnState ? "noHover off" : ""}`}
            onClickHandler={InviteOnClickHandler}>
            <div className="flex justify-evenly items-center">
              <svg viewBox={iconTeamMateSearch.viewBox} className="w-7 h-7">
                {iconTeamMateSearch.paths.map((p, i) => (
                  <path
                    d={p.d}
                    className={`stroke-1 stroke-oldLace fill-transparent`}
                    key={i}
                  />
                ))}
              </svg>
              <span className="hidden lg:block ml-3">Find team-mate</span>
              {findTMBtnState ? (
                <Tooltip arrowDir="left" parentCls="w-max">
                  <p className="text-xxs lg:text-base font-medium normal-case">
                    {tooltipTxt}
                  </p>
                </Tooltip>
              ) : null}
            </div>
          </BtnDefault>
        </div>
      </div>
    </div>
  );
};

/*******************************
 * *****************************
 * Btn to save goals
 *******************************
 ******************************/
const BtnSaveGoals: FC<{
  submitHandler: () => void;
}> = ({ submitHandler }) => {
  const {
    watch,
    formState: { isDirty, isValid, isSubmitting },
  } = useFormContext();
  const goals = watch("goals");

  const isFormInvalid =
    isSubmitting ||
    goals?.length < 2 ||
    goals?.filter(g => {
      if (g?.title?.length <= 3) {
        return true;
      }
    }).length > 0
      ? true
      : false;

  // save btn text
  let btnTxt = "save";
  if (isSubmitting) {
    btnTxt = "saving...";
  }

  let state = false;
  if (isDirty && goals?.length >= 2 && !isFormInvalid) {
    state = true;
  }

  return (
    <BtnDefault
      type="button"
      parentClasses={`relative ${state ? "highlight" : ""}`}
      id="anSaveGoalBtn"
      classes={`md ${isFormInvalid ? "noHover off" : ""}`}
      disabled={isFormInvalid}
      onClickHandler={submitHandler}>
      <div className="flex justify-evenly items-center">
        <svg viewBox={iconSave.viewbox} className="w-6 h-6">
          {iconSave.paths.map((p, i) => (
            <path d={p.d} className={`fill-${p.className}`} key={i} />
          ))}
        </svg>
        <span className="hidden lg:block ml-3">{btnTxt}</span>
        {isFormInvalid ? (
          <Tooltip arrowDir="left" parentCls="w-max">
            <p className="text-xxs lg:text-base font-medium normal-case">
              Add min. of 2 goals to save
            </p>
          </Tooltip>
        ) : null}
      </div>
    </BtnDefault>
  );
};

export default GoalsFormBtns;
