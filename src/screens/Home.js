import React from "react";
import { Text, View } from "react-native";
const HomeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>User List</Text>
    </View>
  );
};
HomeScreen.navigationOptions = {
  title: "User List",
};
export default HomeScreen;
