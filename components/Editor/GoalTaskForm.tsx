import {
  FC,
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  GoalTaskEditorRgtSide,
  GoalTaskFreqSelectorWidget,
} from "app/components";
import { iconAdd, iconBin, iconDownArrow } from "app/utilities/data_svgs_new";
import { StPrismaTaskType } from "app/types";

const ContextShowTaskMenu = createContext(null);

/*******************************
 * *****************************
 * The main goal task form component.
 * This is a custom implementation to make the form
 * navigational with keyboard arrow keys
 * inspired by `contenteditable` DOM feature
 *******************************
 ******************************/
const GoalTaskForm: FC<{
  index: number;
  fieldArrayName: string;
  addFieldOnMount?: boolean;
}> = ({ index, fieldArrayName, addFieldOnMount = false }) => {
  const refKeyPos = useRef<[number, number]>();
  const refKeyDownPos = useRef<number>();
  const [showMenuForTask, setShowMenuForTask] = useState(null);
  const [showFreqSelector, setShowFreqSelector] = useState<number>(null);
  const { control, getValues, register } = useFormContext();
  const { fields, insert, move, remove, update } = useFieldArray({
    name: fieldArrayName,
    control: control,
  });
  const goalType = getValues(`goals[${index}].type`);
  const defaultValue = goalType === "FREQUENT" ? 1 : 0;
  const refPrevDefaultVal = useRef(defaultValue);

  // if Team page edit Goal form,
  // add a new task input field on mount
  useEffect(() => {
    addFieldOnMount &&
      insert(fields.length, {
        content: "",
        timeEst: 15,
        dayFrequency: defaultValue,
        weekFrequency: defaultValue,
      });
  }, []);

  // if task fields empty:
  // add a blank entry so one input is always shown
  useEffect(() => {
    const taskTemplate: StPrismaTaskType = {
      content: "",
      timeEst: 15,
      dayFrequency: defaultValue,
      weekFrequency: defaultValue,
    };
    fields.length === 0 && insert(0, taskTemplate);
  }, [defaultValue, fields, insert]);

  // compare prevDefaultVal vs new defaultValue
  // if different, update all task fields to new defaultValue
  useEffect(() => {
    if (refPrevDefaultVal.current !== defaultValue) {
      fields.forEach((f, i) => {
        const taskContentFromState = getValues(
          `${fieldArrayName}[${i}].content`
        );
        update(i, {
          // @ts-ignore
          content: f.content || taskContentFromState,
          dayFrequency: defaultValue,
          weekFrequency: defaultValue,
        });
      });
      refPrevDefaultVal.current = defaultValue;
    }
  }, [defaultValue, fieldArrayName, fields, getValues, update]);

  const setSelection = (eTarget, children, siblingRef) => {
    const { selectionStart, selectionEnd } = eTarget;
    refKeyPos.current = [selectionStart, selectionEnd];
    const sibling = children[siblingRef].children[0].children[0];
    sibling.setSelectionRange(selectionStart, selectionEnd);
    sibling.focus();
  };

  const getCurElePosition = eTarget => {
    const mum: HTMLElement = eTarget.parentElement.parentElement;
    const parent: HTMLElement = mum.parentElement;
    const children: Element[] = Array.from(parent.children);
    let taskNum;
    children.forEach((el, i) => {
      const elChild = el.children[0].children[0];
      if (elChild === eTarget) {
        taskNum = i;
      }
    });
    return [taskNum, parent, children, mum];
  };

  const keyUpHandler = e => {
    e.preventDefault();
    const eTarget = e.target;
    if (e.key === "Enter") {
      const [elePosition, parent, children, mum] = getCurElePosition(eTarget);
      insert(elePosition + 1, {
        content: "",
        dayFrequency: defaultValue,
        weekFrequency: defaultValue,
      });
    }
    if (e.key === "Backspace") {
      const { selectionStart: selStart, selectionEnd: selEnd } = eTarget;
      // if keyDown starts at 0, only then del line
      if (refKeyDownPos.current === 0 && selStart === 0 && selEnd === 0) {
        // if there is some text in line after cursor then keep cursor on line
        if (!!!eTarget.value.length) {
          const [elePosition, parent, children, mum] =
            getCurElePosition(eTarget);
          if (elePosition > 0) {
            const prevSibling = mum.previousSibling;
            const prevSiblingInput = prevSibling.children[0].children[0];
            prevSiblingInput.setSelectionRange(
              prevSiblingInput.selectionEnd,
              prevSiblingInput.selectionEnd
            );
            prevSiblingInput.focus();
            remove(elePosition);
          }
        }
      }
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      // @ts-ignore
      e.target.setSelectionRange(refKeyPos.current[0], refKeyPos.current[1]);
    }
  };

  const keyDownHandler = e => {
    e.stopPropagation();
    const { target: eTarget, key } = e;
    // const eTarget = e.target;
    if (key === "ArrowUp") {
      const [elePosition, parent, children, mum] = getCurElePosition(eTarget);
      let prevSiblingRef = -1;
      children.forEach((ele, i) => {
        if (ele == mum && i - 1 >= 0) {
          prevSiblingRef = i - 1;
        }
      });
      if (prevSiblingRef >= 0) setSelection(eTarget, children, prevSiblingRef);
    }
    if (key === "ArrowDown") {
      const [elePosition, parent, children, mum] = getCurElePosition(eTarget);
      let nextSiblingRef = -1;
      children.forEach((ele, i, arr) => {
        if (ele == mum && i + 1 <= arr.length - 1) {
          nextSiblingRef = i + 1;
        }
      });
      if (nextSiblingRef > 0) setSelection(eTarget, children, nextSiblingRef);
    }
    if (key === "Backspace") {
      refKeyDownPos.current = e.target.selectionStart;
    }
  };

  const toggleFreqSelector = useCallback(
    taskIndex => {
      showFreqSelector === taskIndex
        ? setShowFreqSelector(null)
        : setShowFreqSelector(taskIndex);
    },
    [showFreqSelector]
  );

  return (
    <div className="tasksContainer">
      <div className="tasksContentSection pseudoBorder">
        <p className="label">
          <span>tasks: </span>
          {/* <span className="req">*</span> */}
        </p>
        <ContextShowTaskMenu.Provider
          value={{ showMenuForTask, setShowMenuForTask }}>
          <div className={`tasksParent`}>
            {fields.map((item, i) => {
              // console.log("fields", item);
              return (
                <TaskParaMum
                  key={item.id}
                  task={item}
                  taskIndex={i}
                  goalIndex={index}
                  register={register}
                  keyUpHandler={keyUpHandler}
                  fieldArrayName={fieldArrayName}
                  fieldOptions={{ insert, move, remove }}
                  keyDownHandler={keyDownHandler}
                  showFreqSelector={showFreqSelector}
                  toggleFreqSelector={toggleFreqSelector}
                />
              );
            })}
          </div>
        </ContextShowTaskMenu.Provider>
      </div>
    </div>
  );
};

/*******************************
 * *****************************
 * On AimHigh.life, tasks are very powerful, allowing the
 * user flexibility to define the time estimate or frequency
 * of task
 * Again: The main inspiration was apps such as
 * Notion, Excel, RoamR, Obsidian etc
 *******************************
 ******************************/
export const TaskParaMum: FC<any> = ({
  task,
  register,
  taskIndex,
  goalIndex,
  keyUpHandler,
  fieldOptions,
  fieldArrayName,
  keyDownHandler,
  showFreqSelector,
  toggleFreqSelector,
}) => {
  const clsParent = showFreqSelector === taskIndex ? "isActive" : "";
  return (
    <div className={`taskParaMum ${clsParent}`}>
      <div className="taskParaWrapper">
        <input
          type="text"
          maxLength={50}
          id={task.id}
          placeholder={`${
            taskIndex > 0
              ? "Next step to achieve the goal"
              : "How to achieve the goal? Add a step."
          }`}
          className="taskPara"
          onKeyDown={keyDownHandler}
          onKeyUp={keyUpHandler}
          {...register(`${fieldArrayName}.${taskIndex}.content`)}
        />
        <GoalTaskEditorRgtSide
          task={task}
          goalIndex={goalIndex}
          taskIndex={taskIndex}
          fieldArrayName={fieldArrayName}
          showFreqSelector={showFreqSelector}
          toggleFreqSelector={toggleFreqSelector}
        />
        <EditTaskCtrlInEditor
          goalIndex={goalIndex}
          taskIndex={taskIndex}
          fieldOptions={fieldOptions}
        />
      </div>
      {(showFreqSelector === taskIndex && (
        <GoalTaskFreqSelectorWidget
          taskIndex={taskIndex}
          goalIndex={goalIndex}
          fieldArrayName={fieldArrayName}
          toggleFreqSelector={toggleFreqSelector}
        />
      )) ||
        null}
    </div>
  );
};

/*******************************
 * *****************************
 * Menu control for each task within tasks section of goal form
 *******************************
 ******************************/
const EditTaskCtrlInEditor: FC<any> = ({
  fieldOptions,
  goalIndex,
  taskIndex,
}) => {
  const { insert, move, remove } = fieldOptions;
  const { getValues } = useFormContext();
  const { showMenuForTask, setShowMenuForTask } =
    useContext(ContextShowTaskMenu);

  const toggleMenu = () =>
    showMenuForTask === taskIndex
      ? setShowMenuForTask(null)
      : setShowMenuForTask(taskIndex);

  const insertTask = () => {
    const goalType = getValues(`goals[${goalIndex}].type`);
    const defaultValue = goalType === "FREQUENT" ? 1 : 0;
    insert(taskIndex + 1, {
      content: "",
      dayFrequency: defaultValue,
      weekFrequency: defaultValue,
    });
    setShowMenuForTask(null);
  };

  const removeTask = () => {
    taskIndex > 0 && remove(taskIndex);
    setShowMenuForTask(null);
  };

  const moveTaskUp = () => {
    if (taskIndex > 0) {
      move(taskIndex, taskIndex - 1);
      setShowMenuForTask(null);
    }
  };

  const moveTaskDown = () => {
    move(taskIndex, taskIndex + 1);
    setShowMenuForTask(null);
  };

  return (
    <div className="taskMenuWrapper">
      <div
        className={`editTaskCtrl ${
          showMenuForTask === taskIndex ? "isActive" : ""
        }`}
        onClick={toggleMenu}>
        <p className="w-3 h-3 text-vividTangerine leading-[0] rotate-90 hover:text-oldLace">
          ...
        </p>
      </div>
      {showMenuForTask === taskIndex && (
        <div className={`taskMenu isActive edgeCurveTL`}>
          <ul>
            <li onClick={insertTask}>
              <svg viewBox={iconAdd.viewbox} className={`w-3 h-3`}>
                {iconAdd.paths.map((p, i) => (
                  <path d={p.d} key={i} />
                ))}
              </svg>
              <span className="ml-2 mb-2">New task</span>
            </li>
            <li onClick={removeTask}>
              <svg viewBox={iconBin.viewbox} className={`w-3 h-3`}>
                {iconBin.paths.map((p, i) => (
                  <path d={p.d} key={i} />
                ))}
              </svg>
              <span className="ml-2 mb-2">Delete task</span>
            </li>
            <li onClick={moveTaskUp}>
              <svg
                viewBox={iconDownArrow.viewbox}
                className={`w-3 h-3 rotate-180`}>
                {iconDownArrow.paths.map((p, i) => (
                  <path d={p.d} key={i} />
                ))}
              </svg>
              <span className="ml-2 mb-2">Move up</span>
            </li>
            <li onClick={moveTaskDown}>
              <svg viewBox={iconDownArrow.viewbox} className={`w-3 h-3`}>
                {iconDownArrow.paths.map((p, i) => (
                  <path d={p.d} key={i} />
                ))}
              </svg>
              <span className="ml-2 mb-2">Move down</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

// GoalTaskForm.whyDidYouRender = true;
export default GoalTaskForm;
