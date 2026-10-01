import React, { useContext, useRef, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Store } from "../../Store";
import { theme } from "../utils/theme";

const rightPages = [
  require("../../assets/tutorial/right/01.png"), require("../../assets/tutorial/right/02.png"), require("../../assets/tutorial/right/03.png"),
  require("../../assets/tutorial/right/04.png"), require("../../assets/tutorial/right/05.png"), require("../../assets/tutorial/right/06.png"),
  require("../../assets/tutorial/right/07.png"), require("../../assets/tutorial/right/08.png"), require("../../assets/tutorial/right/09.png"),
  require("../../assets/tutorial/right/10.png"), require("../../assets/tutorial/right/11.png"), require("../../assets/tutorial/right/12.png"),
  require("../../assets/tutorial/right/13.png"), require("../../assets/tutorial/right/14.png"), require("../../assets/tutorial/right/15.png"),
  require("../../assets/tutorial/right/16.png"), require("../../assets/tutorial/right/17.png"), require("../../assets/tutorial/right/18.png"),
  require("../../assets/tutorial/right/19.png"), require("../../assets/tutorial/right/20.png"), require("../../assets/tutorial/right/21.png"),
  require("../../assets/tutorial/right/22.png"), require("../../assets/tutorial/right/23.png"),
];

const leftPages = [
  require("../../assets/tutorial/left/01.png"), require("../../assets/tutorial/left/02.png"), require("../../assets/tutorial/left/03.png"),
  require("../../assets/tutorial/left/04.png"), require("../../assets/tutorial/left/05.png"), require("../../assets/tutorial/left/06.png"),
  require("../../assets/tutorial/left/07.png"), require("../../assets/tutorial/left/08.png"), require("../../assets/tutorial/left/09.png"),
  require("../../assets/tutorial/left/10.png"), require("../../assets/tutorial/left/11.png"), require("../../assets/tutorial/left/12.png"),
  require("../../assets/tutorial/left/13.png"), require("../../assets/tutorial/left/14.png"), require("../../assets/tutorial/left/15.png"),
  require("../../assets/tutorial/left/16.png"), require("../../assets/tutorial/left/17.png"), require("../../assets/tutorial/left/18.png"),
  require("../../assets/tutorial/left/19.png"), require("../../assets/tutorial/left/20.png"), require("../../assets/tutorial/left/21.png"),
  require("../../assets/tutorial/left/22.png"), require("../../assets/tutorial/left/23.png"),
];

const Tutorial = () => {
  const { dimensions, globalState, insets, setShowTutorial } = useContext(Store);
  const [page, setPage] = useState(0);
  const pages = globalState.options.leftHand ? leftPages : rightPages;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  return (
    <View style={styles.container}>
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `${globalState.options.leftHand ? "left" : "right"}-${index}`}
        getItemLayout={(_, index) => ({ index, length: dimensions.width, offset: dimensions.width * index })}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems[0]) setPage(viewableItems[0].index);
        }}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => <Image source={item} resizeMode="contain" style={{ height: dimensions.height, width: dimensions.width }} />}
      />
      <Pressable style={[styles.exit, { right: insets.right + 18, top: insets.top + 12 }]} onPress={() => setShowTutorial(false)}>
        <Text style={styles.exitText}>Exit</Text>
      </Pressable>
      <Text style={[styles.page, { bottom: insets.bottom + 8 }]}>{page + 1} / {pages.length}</Text>
    </View>
  );
};

export default Tutorial;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.white,
    zIndex: 4000,
  },
  exit: {
    position: "absolute",
    padding: 12,
  },
  exitText: {
    color: theme.colors.lightBlue,
    fontFamily: "blackout",
    fontSize: 18,
    textTransform: "uppercase",
  },
  page: {
    alignSelf: "center",
    color: theme.colors.grey,
    fontFamily: "proletarsk",
    position: "absolute",
  },
});
