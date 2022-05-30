import { FC, useCallback, useEffect } from "react";
import { useMutation, setQueryData } from "blitz";
import { useRecoilValue } from "recoil";
import cloneDeep from "lodash.clonedeep";
import dateCompareAsc from "date-fns/compareAsc";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import {
  GoalFormAddNew,
  ChoreForm,
  GoalForm,
  GoalsFormBtns,
  GoalFormGuide,
} from "app/components";
import { userChoresSt, userGoalsSt, userTaskSt } from "app/state";
import useAddToNotif from "app/hooks/useAddToNotif";
import getUserGoals from "app/queries/getUserGoals";
import saveGoals from "app/mutations/saveGoalsUpdate";
import deleteGoal from "app/mutations/deleteGoal";
import deleteChores from "app/mutations/deleteChore";
import { validateGoalFormData } from "app/utilities/validation";
import {
  StGoalType,
  StPrismaChoreType,
  ClonedTasksForSaveMutationType,
} from "app/types";
import {
  errEditorGoalTitleLength,
  errEditorTaskCount,
  sucOnGoalSave,
} from "app/utilities/notificationMsgs";

/********************************************
 ********************************************
 * This is an example of a really complex code
 * In AimHigh.life, the form to set goals is dynamic
 * i.e: user can add as many goals as they want
 * And within each goal, user can define as many tasks
 * as they want.
 * The entire form is perhaps the most complicated bit of code
 * within the app
 * It certainly can do with some refactor & extracting out
 * the submidHandler func
 ********************************************
 *******************************************/
const GoalsForm: FC<{
  // userGB: any;
  goalsSaveState: {
    areGoalsSaved: boolean;
    setAreGoalsSaved: (arg: boolean) => void;
  };
  teamStartDate: Date | undefined;
}> = ({
  // userGB,
  goalsSaveState,
  teamStartDate,
}) => {
  // console.log("userGB: ", userGB.goal);
  const { areGoalsSaved, setAreGoalsSaved } = goalsSaveState;
  const userChore = useRecoilValue(userChoresSt);
  const userGoal = useRecoilValue(userGoalsSt);
  const userTask = useRecoilValue(userTaskSt);
  const [deleteChoresMutation] = useMutation(deleteChores);
  const [deleteGoalMutation] = useMutation(deleteGoal);
  const [saveGoalsMutation] = useMutation(saveGoals);
  const [addToNotifState] = useAddToNotif();

  const ctx = useForm({
    mode: "onChange",
  });
  const { control, trigger, getValues, reset } = ctx;

  const {
    fields: glFields,
    append: glAppend,
    remove: glRemove,
  } = useFieldArray({
    name: "goals",
    control: control,
    shouldUnregister: true,
  });

  const {
    fields: chFields,
    append: chAppend,
    remove: chRemove,
  } = useFieldArray({
    name: "chores",
    control: control,
    shouldUnregister: true,
  });

  const addGoalForm = useCallback(() => {
    glAppend({
      title: "",
      intro: "",
      deadline: "",
      type: "ONEOFF",
      task: [],
    });
  }, [glAppend]);

  useEffect(() => {
    const sortChores = [];
    if (userChore.length) {
      userChore.forEach(ch => {
        const time = ch.forDate.getTime();
        const found = sortChores.find(ch => ch.on.getTime() === time);
        if (found) {
          found.list.push(ch);
        } else {
          sortChores.push({
            on: ch.forDate,
            list: [ch],
          });
        }
      });
    }
    const initialValues = {
      goals: userGoal.map(g => {
        return {
          ...g,
          task: g.taskIds
            .map(t => {
              return {
                ...userTask.find(uT => uT.id === t),
              };
            })
            .sort((a, b) => a.order - b.order),
        };
      }),
      chores: sortChores,
    };
    reset(initialValues);
    initialValues.goals.length < 2 && addGoalForm();
  }, [userChore, userGoal, userTask, addGoalForm, reset]);

  useEffect(() => {
    trigger();
  }, [trigger]);

  /***********************************************
   * Converts the formData from RHF into a normalised
   * struct for goals. Takes the tasksState and
   * normalises it and adds ref to the goal-index to each task
   * so that if we donot have goalId, we can assign at the backend
   * when saved.
   ***********************************************/
  // const submitHandler = ctx.handleSubmit(async formData => {
  const submitHandler = async () => {
    try {
      const formData = getValues();
      // console.log("formData: ", formData);
      const clonedGoals: StGoalType[] = [];
      const clonedTasks: ClonedTasksForSaveMutationType[] = [];

      formData.goals.forEach((goal, i) => {
        const isFreqGoal = goal.type === "FREQUENT";
        const goalObj: StGoalType = {
          order: i,
          type: goal.type,
          intro: goal.intro,
          title: goal.title,
          deadline: goal.deadline || null,
          id: userGoal[i]?.id || undefined,
          taskIds: [],
        };
        goal.task.forEach((task, j) => {
          const tEstWithinLimit =
            !isFreqGoal && task.timeEst > 0 && task.timeEst <= 60;
          if (task.content.length > 3) {
            const clonedTask = {
              ...task,
              order: j,
              goalIndex: i,
              timeEst: tEstWithinLimit ? Number(task.timeEst) : 15,
              dayFrequency: isFreqGoal
                ? Number(task.dayFrequency) > 0
                  ? Number(task.dayFrequency)
                  : 1
                : 0,
              weekFrequency: isFreqGoal
                ? Number(task.weekFrequency) > 0
                  ? Number(task.weekFrequency)
                  : 1
                : 0,
            };
            delete clonedTask.taskFrequency;
            clonedTasks.push(clonedTask);
          }
        });
        clonedGoals.push(goalObj);
      });

      const formattedGoals = { clonedGoals, clonedTasks };
      const validateGoals = validateGoalFormData(formattedGoals);
      window.scrollTo(0, 0);
      if (validateGoals.goalCount < 2) {
        throw new Error("You must have at least 2 goals");
      } else if (validateGoals.emptyGoals.length) {
        throw new Error(errEditorTaskCount);
      } else if (validateGoals.goalTitles.length) {
        throw new Error(errEditorGoalTitleLength);
      }
      // chores
      let clonedChores: StPrismaChoreType[] = [];
      const n = new Date();
      const d = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0);
      formData.chores?.forEach(choresOn => {
        choresOn.list.forEach(ch => {
          if (ch.content.length > 3 && dateCompareAsc(choresOn.on, d) >= 0) {
            clonedChores.push({
              forDate: choresOn.on,
              content: ch.content,
            });
          }
        });
      });

      const savedData = await saveGoalsMutation({
        goals: formattedGoals,
        chores: clonedChores,
      });
      if (savedData instanceof Error) throw savedData;
      setAreGoalsSaved(true);
      addToNotifState("success", sucOnGoalSave);
      setQueryData(
        getUserGoals,
        null,
        old => {
          const newData = cloneDeep(old);
          newData.chore = savedData.chores;
          newData.goal = savedData.goals.map(g => {
            const task = [];
            savedData.tasks.forEach(t => {
              if (t.goalId === g.id) {
                const oldGoal = old?.goal?.find(g => g.id === t.goalId);
                // @ts-ignore
                const oldTask = oldGoal?.task?.find(task => task.id === t.id);
                const oldTaskFreqs = oldTask?.taskFrequency || [];
                task.push({
                  ...t,
                  taskFrequency: oldTaskFreqs,
                });
              }
            });
            return {
              ...g,
              task,
            };
          });
          return newData;
        },
        { refetch: false }
      );
    } catch (err) {
      console.error("onSaveGoals submitHandler:::", err);
      Array.isArray(err)
        ? err.forEach(err => {
            addToNotifState("error", err.message);
          })
        : addToNotifState("error", err.message);
    }
  };

  // Deletes a Goal box
  const removeGoalForm = async index => {
    try {
      glRemove(index);
      const goalId = userGoal[index]?.id;
      if (goalId) {
        const isDeleted = await deleteGoalMutation(goalId);
        if (isDeleted instanceof Error) throw isDeleted;
        setQueryData(
          getUserGoals,
          null,
          old => ({
            ...old,
            goal: old.goal.filter(g => g.id !== goalId),
          }),
          { refetch: false }
        );
      }
    } catch (err) {
      addToNotifState("error", err);
    }
  };

  // Deletes a Chores box
  // identify the chore form index to delete
  // call mutation with a set of chores to delete
  // update the local chores state
  const removeChoreForm = async index => {
    try {
      const choreDate = userChore[index].forDate;
      const isDeleted = await deleteChoresMutation(choreDate);
      if (isDeleted instanceof Error) throw isDeleted;
      setQueryData(
        getUserGoals,
        null,
        old => ({
          ...old,
          // @ts-ignore
          chores: old.chore.filter(c => c.forDate !== choreDate),
        }),
        { refetch: false }
      );
      chRemove(index);
    } catch (err) {
      addToNotifState("error", err);
    }
  };

  return (
    <div className="goalsForm">
      {/* <DevTool control={control} placement={"bottom-right"} /> */}
      <FormProvider {...ctx}>
        <form className="flex flex-col h-full" onSubmit={submitHandler}>
          <div className="block lg:grid lg:grid-cols-2 lg:gap-8">
            {glFields.map((item, i) => (
              <GoalForm
                index={i}
                item={item}
                teamStartDate={teamStartDate}
                removeGoalForm={removeGoalForm}
                key={item.id}
              />
            ))}
            {chFields.map((item, i) => (
              <ChoreForm
                item={item}
                index={i}
                key={item.id}
                removeChoreForm={removeChoreForm}
                teamStartDate={teamStartDate}
              />
            ))}
            <GoalFormAddNew appends={{ glAppend, chAppend }} />
            <GoalFormGuide />
          </div>
          <GoalsFormBtns
            submitHandler={submitHandler}
            teamStartDate={teamStartDate}
            areGoalsSavedState={areGoalsSaved}
          />
        </form>
      </FormProvider>
    </div>
  );
};

export default GoalsForm;
