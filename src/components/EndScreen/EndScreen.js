import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { colors, colorsToEmoji } from "../../constants";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Number = ({ number, label }) => (
  <View style={{ alignItems: "center", margin: 10 }}>
    <Text style={{ color: colors.lightgrey, fontSize: 30, fontWeight: "bold" }}>
      {number}
    </Text>
    <Text style={{ color: colors.lightgrey, fontSize: 16 }}>{label}</Text>
  </View>
);

const GuessDistributionLine = ({ position, amount, percentage }) => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
      <Text style={{ color: colors.lightgrey }}>{position}</Text>
      <View
        style={{
          alignSelf: "stretch",
          backgroundColor: colors.grey,
          margin: 5,
          padding: 5,
          width: `${percentage}%`,
        }}
      >
        <Text style={{ color: colors.lightgrey }}>{amount}</Text>
      </View>
    </View>
  );
};

const GuessDistribution = () => {
  return (
    <>
      <Text style={styles.subtitle}>GUESS DISTRIBUTION</Text>
      <View style={{ width: "100%", padding: 20 }}>
        <GuessDistributionLine position={0} amount={2} percentage={50} />
        <GuessDistributionLine position={3} amount={2} percentage={70} />
      </View>
    </>
  );
};

const Endscreen = ({ won = false, rows, getCellBGColor }) => {
  const [secondsTillTomorrow, setSecondsTillTomorrow] = useState(0);
  const [played,setPlayed] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [curStreak, setCurStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  useEffect(() => {
    readState();
  },[]);

  const share = () => {
    const textMap = rows
      .map((row, i) =>
        row.map((cell, j) => colorsToEmoji[getCellBGColor(i, j)]).join("")
      )
      .filter((row) => row)
      .join("\n");

    const textToShare = `My Wordle solution \n ${textMap}`;
    Clipboard.setString(textToShare);
    Alert.alert("Copied successfully!", "Share your score on social media!");
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      setSecondsTillTomorrow((tomorrow - now) / 1000);
    }
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const readState = async () => {
    const dataString = await AsyncStorage.getItem("@game");
    let data;
    try {
      const data = JSON.parse(dataString);
    } catch (e) {
      console.log("Couldn't parse the state.");
    }
    setPlayed(Object.keys(data).length)
    const numberOfWins = setLoaded(true);
  };

  const formatSeconds = () => {
    const hours = Math.floor(secondsTillTomorrow / (60 * 60));
    const minutes = Math.floor((secondsTillTomorrow % (60 * 60)) / 60);
    const seconds = Math.floor(secondsTillTomorrow % 60);

    return `${hours}:${minutes}:${seconds}`;
  }

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <Text style={styles.title}>
        {won ? "Congrats!" : "Meh, try again tomorrow"}
      </Text>

      <Text style={styles.subtitle}>STATISTICS</Text>
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <Number number={played} label={"Played"} />
        <Number number={winRate} label={"Win %"} />
        <Number number={curStreak} label={"Cur streak"} />
        <Number number={maxStreak} label={"Max streak"} />
      </View>

      <GuessDistribution />

      <View style={{ flexDirection: "row", padding: 10 }}>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ color: colors.lightgrey }}>Next Wordle</Text>
          <Text
            style={{
              color: colors.lightgrey,
              fontSize: 24,
              fontWeight: "bold",
            }}
          >
            {formatSeconds()}
          </Text>
        </View>

        <Pressable
          onPress={share}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
            Share
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    color: "white",
    textAlign: "center",
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 20,
    color: colors.lightgrey,
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "bold",
  },
});
export default Endscreen;

/*
2.23.54  https://www.youtube.com/watch?v=2ZD1qqlAURQ&t=4310s&ab_channel=notJust%E2%80%A4dev
*/
