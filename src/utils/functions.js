import AsyncStorage from "@react-native-async-storage/async-storage";

//store global state in local storage
export const storeGlobalState = async (value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem("globalState", jsonValue);
  } catch (e) {
    throw e;
  }
};

export const removeStorage = async () => {
  try {
    await AsyncStorage.removeItem("globalState");
  } catch (e) {
    throw e;
  }
};