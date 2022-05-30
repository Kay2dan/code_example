import { atom, selector } from "recoil";
import { StPrismaTeamType } from "app/types";

/*******************************
 *******************************
 * Recoil state definition
 *******************************
 *******************************/
export const teamState = atom({
  key: "teamState",
  default: {} as StPrismaTeamType,
});

/*******************************
 *******************************
 * Recoil has build in selector feature
 * (like redux selectors) so we can
 * only subscribe to bits of data within
 * the team-state
 *******************************
 *******************************/
export const teamDateSelector = selector({
  key: "teamStartDate",
  get: ({ get }) => {
    const teamStateAtom = get(teamState);
    return {
      start: teamStateAtom?.startDate || null,
      end: teamStateAtom?.endDate || null,
    };
  },
});

/*******************************
 *******************************
 * Another example of selector
 *******************************
 *******************************/
export const teamStatusSelector = selector({
  key: "teamStatus",
  get: ({ get }) => {
    return get(teamState)?.id;
  },
});
