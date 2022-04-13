import React, { useContext } from 'react';
import { View } from 'react-native';
import Svg from "react-native-svg";

import AnchorFrets from './AnchorFrets';
import Note from './Note';
import Frets from './Frets';
import Strings from './Strings';
import { Store } from "../../../Store";

const Neck = () => {
  const { globalState } = useContext(Store);
  const frets = [...Array(17).keys()];
  const strings = [...Array(6).keys()];

  return (
    // TODO: make container responsive
    <View style={{ right: 20, width: 838, height: 233 }}>
      <Svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <Strings />
        <Frets />
        {globalState.options.hideAnchorFrets && <AnchorFrets />}
        {strings.map(s => frets.map((f, i)=> <Note key={i} fret={f} string={s+1}/>))}
      </Svg>
    </View>
  )
}

export default Neck;
