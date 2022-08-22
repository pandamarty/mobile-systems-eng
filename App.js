import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  View,
  Text,
  Button,
  SafeAreaView,
  Image,
} from "react-native";
import { colors } from "./src/constants";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Game from "./src/components/Game";

const HomeScreen = ({ navigation }) => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.darkgrey,
      }}
    >
      <Image
        source={require("./assets/logo.png")}
        style={{ width: 150, height: 150 }}
      />
      <Text
        style={{
          color: colors.lightgrey,
          fontWeight: "bold",
          fontSize: 25,
          textAlign: "center",
        }}
      >
        Welcome to a new WORDLE game!
      </Text>
      <Button
        title="New game"
        color={"#538D4E"}
        style={{ fontSize: 35 }}
        onPress={() =>
          navigation.navigate("Play") &&
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        }
      />
    </View>
  );
};

function PlayScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>WORDLE</Text>

      <Game />
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerStyle: {
              backgroundColor: colors.darkgrey,
              headerTintColor: colors.lightgrey,
            },
          }}
        />
        <Stack.Screen
          name="Play"
          component={PlayScreen}
          options={{
            headerStyle: { backgroundColor: colors.darkgrey },
            headerTintColor: colors.lightgrey,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 7,
  },
});
