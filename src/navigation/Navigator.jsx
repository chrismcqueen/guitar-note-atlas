import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";

import { Home } from "../screens/Home";
import Menu from "./Menu";
import { Store } from "../../Store";

export const Navigator = () => {
  const { header } = useContext(Store);
  const Drawer = createDrawerNavigator();

  return (
    <NavigationContainer>
      <Drawer.Navigator drawerPosition="right" screenOptions={{ title: header }} drawerContent={Menu} initialRouteName="Home">
        <Drawer.Screen name="Home" component={Home} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({});
