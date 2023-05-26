import { useContext } from "react";
import { Store } from "../../../Store";

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

  const getScaleDegree = (d) => {
    switch (d) {
      case 0:
        return "1";
        break;
      case 1:
        return "b2";
        break;
      case 2:
        return "2";
        break;
      case 3:
        return "b3";
        break;
      case 3.1:
        return "#2";
        break;
      case 4:
        return "3";
        break;
      case 5:
        return "4";
        break;
      case 6:
        return "b5";
        break;
      case 6.1:
        return "#4";
        break;
      case 7:
        return "5";
        break;
      case 8:
        return "b6";
        break;
      case 8.1:
        return "#5";
        break;
      case 9:
        return "6";
        break;
      case 10:
        return "b7";
        break;
      case 11:
        return "7";
        break;
    }
  };

  return { handleClear, handleAll, getScaleDegree, degrees };
};
