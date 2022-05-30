import { useSetRecoilState } from "recoil";
import { notificationSt, showNotificationSt } from "app/state";
import { genId } from "app/utilities/reactHelpers";
import { NotificationOptionType, NotifStatePropType } from "app/types";


/*******************************
 *******************************
 * A custom hook which updates the notifications
 * for the user. It follows the useState pattern of returning
 * a function with closure around set-notifs states 
 *******************************
 *******************************/

export const useAddToNotifState = () => {
  const setNotifState = useSetRecoilState(notificationSt);
  const setShowNotif = useSetRecoilState(showNotificationSt);
  return [
    (
      type: NotificationOptionType,
      message: string,
      notifData?: NotifStatePropType
    ) => {
      const id = notifData?.id || genId();
      setNotifState(prevNotifSt => [
        ...prevNotifSt,
        {
          ownerType: "user",
          actType: "OTHER",
          evType: "other",
          evTypeId: null,
          ...notifData,
          id,
          type,
          message,
        },
      ]);
      setShowNotif(prevShowNotifSt => [...prevShowNotifSt, id]);
    },
  ];
};

export default useAddToNotifState;
