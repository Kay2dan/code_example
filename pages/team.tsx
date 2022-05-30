import { FC, useEffect, useState } from "react";
import db from "db";
import { getSession, useQuery } from "blitz";
import { useSetRecoilState } from "recoil";
import Layout from "app/layouts/Layout";
import {
  CalParent,
  Dashboard,
  MsgsIcon,
  TMSideInTeam,
  MeetCalParent,
  TeamViewMobile,
  UserSideInTeam,
  TeamMenuWrapper,
} from "app/components";
import { tMProfileSt, userProfileSt } from "app/state";
import { useSetTeamStates } from "app/hooks/useSetTeamStates";
import getTeamGoalBoards from "app/queries/getTeamGoalBoards";
import { errGeneric2 } from "app/utilities/notificationMsgs";
import { StPrismaGBType } from "app/types";

export type TeamViewType = "team" | "teamMeeting" | "timeTracker";

/*******************************
 *******************************
 * The page component which serves as a wrapper,
 * fetches goalBoards
 * for the Team page component.
 *******************************
 *******************************/
const TeamPageWrapper: FC & {
  getLayout: (page: JSX.Element) => JSX.Element;
} = props => {
  const [fetchedGBs, resMeta] = useQuery(getTeamGoalBoards, "all", {
    refetchInterval: 300000, // 5min
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 300000,
  });
  if (resMeta.isSuccess && fetchedGBs) {
    return <TeamPage fetchedGBs={fetchedGBs} />;
  } else return <p className="block">{errGeneric2}</p>;
};

/*******************************
 *******************************
 * The main component that sets the states for team page
 * This is added to demonstrate some of the great features
 * that Recoil brings, such as subscribing to state value/
 * setState functions. This helps with reducing React diff
 * algo trigger when there is no need to subscribe to particular
 * state
 *******************************
 *******************************/
const TeamPage: FC<{ fetchedGBs: StPrismaGBType }> = ({ fetchedGBs }) => {
  const setTMProfile = useSetRecoilState(tMProfileSt);
  const setUserProfile = useSetRecoilState(userProfileSt);
  const [teamView, setTeamView] = useState<TeamViewType>("team");
  const [activeView, setActiveView] = useState<"user" | "tM" | "both">("both");
  const [setTeamStates] = useSetTeamStates();

  useEffect(() => {
    const { team } = fetchedGBs;
    let fetchedUserGB;
    let fetchedTMGB;
    if (fetchedGBs?.id === team?.goalBoard?.[0]?.id) {
      fetchedUserGB = team.goalBoard[0];
      fetchedTMGB = team.goalBoard[1];
    } else if (fetchedGBs?.id === team?.goalBoard?.[1]?.id) {
      fetchedUserGB = team.goalBoard[1];
      fetchedTMGB = team.goalBoard[0];
    } else {
      fetchedUserGB = fetchedGBs;
    }
    setTeamStates(fetchedTMGB, fetchedUserGB, team);
    fetchedTMGB && setTMProfile(fetchedTMGB.goalOwner?.profile);
    setUserProfile(fetchedUserGB.goalOwner?.profile);
  }, [fetchedGBs, setTeamStates, setTMProfile, setUserProfile]);

  let userFirstName, tMFirstName;

  if (fetchedGBs?.id === fetchedGBs?.team?.goalBoard?.[0]?.id) {
    userFirstName = fetchedGBs?.team.user1.firstName;
    tMFirstName = fetchedGBs?.team.user2.firstName;
  } else if (fetchedGBs?.id === fetchedGBs?.team?.goalBoard?.[1]?.id) {
    userFirstName = fetchedGBs?.team.user2.firstName;
    tMFirstName = fetchedGBs?.team.user1.firstName;
  }

  return (
    <div className="wrapper pageTeamParent">
      <div className="dashboardParent">
        <Dashboard teamState={{ teamView, setTeamView }} />
      </div>
      <div className="teamContentParent">
        <TeamMenuWrapper teamView={teamView} />
        <CalParent
          startDate={fetchedGBs?.team?.startDate}
          endDate={fetchedGBs?.team?.endDate}
        />
        {(teamView === "team" && (
          <>
            <TeamViewMobile viewState={{ activeView, setActiveView }} />
            <div className="goalsContainerParent">
              <UserSideInTeam
                firstName={userFirstName || "undefined"}
                view={activeView}
              />
              <TMSideInTeam
                firstName={tMFirstName || "undefined"}
                view={activeView}
              />
            </div>
          </>
        )) ||
          null}
        {(teamView === "teamMeeting" && (
          <MeetCalParent
            startDate={fetchedGBs?.team?.startDate}
            endDate={fetchedGBs?.team?.endDate}
          />
        )) ||
          null}
        <MsgsIcon />
      </div>
    </div>
  );
};

/*******************************
 *******************************
 *
 *******************************
 *******************************/
export const getServerSideProps = async ctx => {
  const session = await getSession(ctx.req, ctx.res);
  const teamData = await db.user.findUnique({
    where: {
      id: session.userId || "randomString0123456789",
    },
    select: {
      id: true,
      teamAsUser1: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
        },
      },
      teamAsUser2: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (teamData?.teamAsUser1?.[0]?.id || teamData?.teamAsUser2?.[0]?.id) {
    return {
      props: {},
    };
  } else if (session?.userId) {
    return {
      redirect: {
        destination: "/edit",
        permanent: false,
      },
    };
  } else
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
};

/*******************************
 *******************************
 *
 *******************************
 *******************************/
TeamPageWrapper.getLayout = page => (
  <Layout title="AimHigh.Team">{page}</Layout>
);

export default TeamPageWrapper;
