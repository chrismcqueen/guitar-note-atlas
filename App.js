import React, { useState } from "react";
import { useFonts } from "expo-font";

import Header from "./src/components/Header";
import Menu from "./src/components/Menu";
import Options from "./src/components/Options";
import Main from "./src/components/Main";
import { Splash } from "./src/components/Splash";
import { StoreProvider } from "./Store";

export default function App() {
  let [fontsLoaded] = useFonts({
    blackout: require("./src/utils/fonts/BlackoutMidnight.ttf"),
    basicManual: require("./src/utils/fonts/SVBasicManual-Bold.ttf"),
    opus: require("./src/utils/fonts/OpusTextStd.otf"),
    proletarsk: require("./src/utils/fonts/Proletarsk.ttf"),
  });
  const [loading, setLoading] = useState(true);

  return (
    <StoreProvider>
      {!fontsLoaded || loading ? (
        <Splash setLoading={setLoading} />
      ) : (
        <>
          <Main />
          <Menu />
          <Header />
          <Options />
        </>
      )}
    </StoreProvider>
  );
}
