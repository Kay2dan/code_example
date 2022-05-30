import { atom, selector } from "recoil";
import { StPrismaTeamType } from "app/types";

/*******************************
 *******************************
 *
 *******************************
 *******************************/
export const teamState = atom({
  key: "teamState",
  default: {} as StPrismaTeamType,
});

/*******************************
 *******************************
 *
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
 *
 *******************************
 *******************************/
export const teamStatusSelector = selector({
  key: "teamStatus",
  get: ({ get }) => {
    return get(teamState)?.id;
  },
});
