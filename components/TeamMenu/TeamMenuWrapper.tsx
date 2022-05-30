import { FC, useRef, useEffect } from "react";
import { setQueryData, useMutation } from "blitz";
import { useRecoilValue } from "recoil";
import cloneDeep from "lodash.clonedeep";
import { TeamMenu } from "app/components";
import { meetingExpiredSr } from "app/state";
import disableMeeting from "app/mutations/disableMeetings";
import { TeamViewType } from "app/pages/team";
import getTeamEvents from "app/queries/getTeamEvents";

/*******************************
 * *****************************
 * Wrapper for Team Menu section
 * THis is an example of micro optimisation for multiple renders
 * *****************************
 *******************************/
const TeamMenuWrapper: FC<{ teamView: TeamViewType }> = ({ teamView }) => {
  const newExpiredMeeting = useRecoilValue(meetingExpiredSr);
  const [disableMeetingsMutation] = useMutation(disableMeeting);
  const refDBUpdateInProgress = useRef(false);

  useEffect(() => {
    async function updateDBForMeetingsChangeLog() {
      try {
        const meetingIds = newExpiredMeeting.map(m => m.id);
        const res = await disableMeetingsMutation(meetingIds);
        if (res instanceof Error) throw res;
        const now = new Date();
        setQueryData(
          getTeamEvents,
          null,
          old => {
            const newData = cloneDeep(old);
            newData.meeting.forEach(m => {
              if (meetingIds.includes(m.id)) {
                m.active = false;
              }
            });
            newData.events.forEach(tE => {
              if (meetingIds.includes(tE.meetingId)) {
                tE.notifyUser = false;
                tE.readAt = now;
              }
            });
            return newData;
          },
          { refetch: false }
        );
        refDBUpdateInProgress.current = false;
      } catch (err) {
        console.log("err: ", err);
      }
    }

    if (newExpiredMeeting?.length) {
      if (refDBUpdateInProgress.current === false) {
        refDBUpdateInProgress.current = true;
        updateDBForMeetingsChangeLog();
      }
    }
  }, [disableMeetingsMutation, newExpiredMeeting]);

  return <TeamMenu teamView={teamView} />;
};

export default TeamMenuWrapper;
