import { useContext } from "react";
import { Store } from "../../../Store";
import { data } from "../../../data";
import { findMatchingScale, getScaleDegreeLabel } from "../../utils/music.mjs";

export const useFooter = () => {
  const { globalState, setGlobalState } = useContext(Store);

  const degrees = [{ d: 0 }, { d: 1 }, { d: 2 }, { d: 3.1, e: 3 }, { d: 4 }, { d: 5 }, { d: 6.1, e: 6 }, { d: 7 }, { d: 8.1, e: 8 }, { d: 9 }, { d: 10 }, { d: 11 }];

  const handleClear = () => {
    setGlobalState({
      ...globalState,
      scale: {
        title: "",
        long_title: "",
        menu_title: "",
        degrees: [],
      },
    });
  };

  const handleAll = () => {
    setGlobalState({
      ...globalState,
      scale: {
        title: "Chromatic Scale",
        long_title: "Chromatic Scale",
        menu_title: "Chromatic Scale",
        degrees: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      },
    });
  };

  const getScaleDegree = getScaleDegreeLabel;

  const getMatchingScale = (selectedDegrees) => {
    return findMatchingScale(selectedDegrees, data.scales);
  };

  return { handleClear, handleAll, getScaleDegree, getMatchingScale, degrees };
};
