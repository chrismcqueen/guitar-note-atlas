import React from 'react'
import { Path } from "react-native-svg";

import { theme } from '../../utils/theme'

const AnchorFrets = () => {
  // TODO: replace fret paths
  return (
    <>
      <Path d="M164,233a3.5,3.5,0,1,0-3.5-3.5A3.5,3.5,0,0,0,164,233Z" transform="translate(-0.482 -0.481)"/>
      <Path d="M164,232.5a3,3,0,1,0-3-3A3,3,0,0,0,164,232.5Z" transform="translate(-0.482 -0.481)" fill={theme.colors.black} stroke={theme.colors.black} strokeWidth="1"/>
      <Path d="M262,232.5a3,3,0,1,0-3-3A3,3,0,0,0,262,232.5Z" transform="translate(-0.482 -0.481)" fill={theme.colors.black} stroke={theme.colors.black} strokeWidth="1"/>
      <Path d="M360,232.5a3,3,0,1,0-3-3A3,3,0,0,0,360,232.5Z" transform="translate(-0.482 -0.481)" fill={theme.colors.black} stroke={theme.colors.black} strokeWidth="1"/>
      <Path d="M458,232.5a3,3,0,1,0-3-3A3,3,0,0,0,458,232.5Z" transform="translate(-0.482 -0.481)" fill={theme.colors.black} stroke={theme.colors.black} strokeWidth="1"/>
      <Path d="M601,232.5a3,3,0,1,0-3-3A3,3,0,0,0,601,232.5Z" transform="translate(-0.482 -0.481)" fill={theme.colors.black} stroke={theme.colors.black} strokeWidth="1"/>
      <Path d="M611,232.5a3,3,0,1,0-3-3A3,3,0,0,0,611,232.5Z" transform="translate(-0.482 -0.481)" fill={theme.colors.black} stroke={theme.colors.black} strokeWidth="1"/>
      <Path d="M754,232.5a3,3,0,1,0-3-3A3,3,0,0,0,754,232.5Z" transform="translate(-0.482 -0.481)" fill={theme.colors.black} stroke={theme.colors.black} strokeWidth="1"/>
    </>
  )
}

export default AnchorFrets;
