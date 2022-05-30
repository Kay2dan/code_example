import db from "db";
import { SessionContext } from "blitz";

const goalDataToGet = {
  select: {
    id: true,
    type: true,
    intro: true,
    order: true,
    title: true,
    endDate: true,
    deadline: true,
    startDate: true,
    task: {
      select: {
        id: true,
        order: true,
        content: true,
        timeEst: true,
        endDate: true,
        startDate: true,
        dayFrequency: true,
        weekFrequency: true,
        taskFrequency: {
          select: {
            id: true,
            taskId: true,
            forDate: true,
            completedOn: true,
          },
        },
      },
    },
  },
};

const choreDataToGet = {
  select: {
    id: true,
    forDate: true,
    completedOn: true,
    order: true,
    content: true,
  },
};

/*******************************
 * *****************************
 * Main query func to get the team goal boards
 * *****************************
 *******************************/
const getTeamGoalBoards = async (
  modelsToGet: "all" | "onlyGB" = "all",
  ctx: { session?: SessionContext } = {}
) => {
  try {
    ctx.session?.$authorize();
    const { userId } = ctx.session!;
    return await getTeamGBsFromDB(userId, "all");
  } catch (err) {
    return err;
  }
};

export default getTeamGoalBoards;

/*******************************
 * *****************************
 * Get the team goalBoards
 * if 'modelsToGet' arg is 'all', then get userInfo too
 * else only get the GoalBoards
 * *****************************
 *******************************/
export const getTeamGBsFromDB = async (
  userId,
  modelsToGet: "all" | "onlyGB" = "all"
) => {
  const userInfoToRequest: any = {};
  const goalOwnerContainer: any = {};
  const memberContainer: any = {};

  if (modelsToGet === "all") {
    userInfoToRequest.select = {
      id: true,
      firstName: true,
      profile: {
        select: {
          profession: true,
          location: true,
          missionStatement: true,
          avatar: true,
        },
      },
    };
    goalOwnerContainer.goalOwner = userInfoToRequest;
    memberContainer.user1 = userInfoToRequest;
    memberContainer.user2 = userInfoToRequest;
  }

  return await db.goalBoard.findFirst({
    where: {
      isActive: true,
      goalOwnerId: userId,
    },
    select: {
      id: true,
      team: {
        select: {
          id: true,
          isActive: true,
          startDate: true,
          endDate: true,
          ...memberContainer,
          goalBoard: {
            select: {
              id: true,
              createdAt: true,
              expiresAt: true,
              goal: goalDataToGet,
              chore: choreDataToGet,
              ...goalOwnerContainer,
            },
          },
        },
      },
    },
  });
};
