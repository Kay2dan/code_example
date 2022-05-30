import { FC, memo, useEffect, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import dateAdd from "date-fns/add";
import dateFormatDistance from "date-fns/formatDistanceStrict";
import dateCompareAsc from "date-fns/compareAsc";
import {
  BtnJoinCall,
  BtnTeamMenuSection,
  Team3DayGracePeriod,
  TeamEndConfirmationBox,
} from "app/components";
import { meetingDueFindSr, overlaySt, teamDateSr, timerSt } from "app/state";
import { TeamViewType } from "app/pages/team";

/*******************************
 * *****************************
 * The Team menu notifies user of pending events
 * Uses Memo to memoise values & stop unnecessary renders
 * *****************************
 *******************************/
const TeamMenuMemo: FC<{ teamView: TeamViewType }> = memo(({ teamView }) => {
  const [showNotice, setShowNotice] = useState(false);
  const [showTeamMenu, setShowTeamMenu] = useState(false);
  const [isTeamValid, setIsTeamValid] = useState(null);
  const timer = useRecoilValue(timerSt);
  const teamDates = useRecoilValue(teamDateSr);
  const setOverlay = useSetRecoilState(overlaySt);
  const meetingDue = useRecoilValue(meetingDueFindSr);

  let timeDiff = useRef<string>();
  let threeDaysPostStart = useRef<Date>();
  let isWithin3DayGracePeriod = useRef<boolean>();
  let isWithin1DayPostGracePeriod = useRef<boolean>();
  let oneDayPostGracePeriod = useRef<Date>();

  const toggleTeamMenu = () => setShowTeamMenu(!showTeamMenu);

  const toggleDisbandTeam = () => {
    setOverlay(pr => (pr[0] === "empty" ? ["none"] : ["empty", "", closeMsg]));
    setShowTeamMenu(!showTeamMenu);
    setShowNotice(!showNotice);
  };

  const closeMsg = () => {
    setShowTeamMenu(false);
    setShowNotice(false);
    setOverlay(prev => ["none", "", null]);
  };

  useEffect(() => {
    const isTeamValidPostGracePeriodLC = localStorage.getItem(
      "isTeamValidPostGracePeriod"
    );
    const isTeamValidPostGracePeriod = JSON.parse(isTeamValidPostGracePeriodLC);
    typeof isTeamValidPostGracePeriod === "boolean" &&
      setIsTeamValid(isTeamValidPostGracePeriod);
  }, []);

  useEffect(() => {
    if (teamDates?.start) {
      // const start = teamDates.start;
      const start = new Date(2022, 4, 25, 10, 0, 0); // TEMP
      threeDaysPostStart.current = dateAdd(start, {
        days: 2,
        hours: 23,
        minutes: 59,
        seconds: 59,
      });
      oneDayPostGracePeriod.current = dateAdd(threeDaysPostStart.current, {
        days: 1,
      });
      timeDiff.current = dateFormatDistance(threeDaysPostStart.current, timer, {
        unit: "hour",
      });
      isWithin3DayGracePeriod.current =
        dateCompareAsc(timer, threeDaysPostStart.current) <= 0 ? true : false;
      isWithin1DayPostGracePeriod.current =
        dateCompareAsc(timer, threeDaysPostStart.current) > 0 &&
        dateCompareAsc(timer, oneDayPostGracePeriod.current) < 0
          ? true
          : false;
      if (isTeamValid === null && isWithin1DayPostGracePeriod.current)
        setOverlay(["empty", "", null]);
    }
  });

  return (
    <div className="relative px-4 lg:px-8 mt-10 mb-2">
      <div className="flex justify-between items-center">
        <h1>
          {(teamView === `teamMeeting` && `Team Meeting`) ||
            (teamView === `timeTracker` && `Time Tracker`) ||
            `Team`}
        </h1>
        <div className="teamOptionsBar">
          <BtnTeamMenuSection
            showTeamMenu={showTeamMenu}
            toggleTeamMenu={toggleTeamMenu}
            toggleDisbandTeam={toggleDisbandTeam}
          />
          {!!meetingDue ? <BtnJoinCall call={meetingDue} /> : null}
          {isWithin3DayGracePeriod.current ? (
            <Team3DayGracePeriod
              timeDiff={timeDiff.current}
              toggleDisbandTeam={toggleDisbandTeam}
            />
          ) : null}
        </div>
      </div>
      {showNotice ||
      (isWithin1DayPostGracePeriod.current && isTeamValid === null) ? (
        <TeamEndConfirmationBox
          closeMsg={closeMsg}
          setIsTeamValid={setIsTeamValid}
          isWithin3DayGracePeriod={isWithin3DayGracePeriod.current}
          isWithin1DayPostGracePeriod={isWithin1DayPostGracePeriod.current}
        />
      ) : null}
    </div>
  );
});

export default TeamMenuMemo;
