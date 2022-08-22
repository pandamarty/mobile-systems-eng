import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { colors, colorsToEmoji } from "../../constants";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { SlideInLeft } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const Number = ({ number, label }) => (
  <View style={{ alignItems: "center", margin: 10 }}>
    <Text style={{ color: colors.lightgrey, fontSize: 30, fontWeight: "bold" }}>
      {number}
    </Text>
    <Text style={{ color: colors.lightgrey, fontSize: 16 }}>{label}</Text>
  </View>
);

/*const GuessDistributionLine = ({ position, amount, percentage }) => {
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
          winWidth: 20,
        }}
      >
        <Text style={{ color: colors.lightgrey }}>{amount}</Text>
      </View>
    </View>
  );
};*/

/*const GuessDistribution = ({ distribution }) => {
  if (!distribution) {
    return null;
  }
  const sum = distribution.reduce((total, dist) => dist + total, 0);
  return (
    <>
      <Text style={styles.subtitle}>GUESS DISTRIBUTION</Text>
      <View style={{ width: "100%", padding: 20 }}>
        {distribution.map((dist, index) => {
          <GuessDistributionLine
            key={index}
            position={index + 1}
            amount={dist}
            percentage={(100 * dist) / sum}
          />;
        })}
      </View>
    </>
  );
};*/

const Endscreen = ({ won = false, rows, getCellBGColor }) => {
  const [secondsTillTomorrow, setSecondsTillTomorrow] = useState(0);
  const [played, setPlayed] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [curStreak, setCurStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  //const [distribution, setDistribution] = useState(null);

  useEffect(() => {
    readState();
  }, []);

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

  const restartGame = () => {
    setRows(
      new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill(""))
    );
    setGameState("playing");
    //getNewWord();
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      setSecondsTillTomorrow((tomorrow - now) / 1000);
    };
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const readState = async () => {
    const dataString = await AsyncStorage.getItem("@game");
    let data;
    try {
      data = JSON.parse(dataString);
    } catch (e) {
      console.log("Couldn't parse the state.");
    }

    const keys = Object.keys(data);
    const values = Object.values(data);

    setPlayed(keys.length);

    const numberOfWins = values.filter(
      (game) => game.gameState === "won"
    ).length;
    setWinRate(Math.floor((100 * numberOfWins) / keys.length));

    let _curStreak = 0;
    let maxStreak = 0;
    let prevDay = 0;

    keys.forEach((key) => {
      const day = parseInt(key.split("-")[1]);
      if (data[key].gameState === "won" && _curStreak === 0) {
        _curStreak += 1;
      } else if (data[key].gameState === "won" && prevDay + 1 === day) {
        _curStreak += 1;
      } else {
        if (_curStreak > maxStreak) {
          maxStreak = _curStreak;
        }
        _curStreak = data[key].gameState === "won" ? 1 : 0;
      }
      prevDay = day;
    });
    setCurStreak(_curStreak);
    setMaxStreak(maxStreak);

    /*guess distribution
    const dist = [0, 0, 0, 0, 0, 0];

    values.map((game) => {
      if (game.gameState === "won") {
        const tries = game.rows.filter((row) => row[0]).length;
        dist[tries] = dist[tries] + 1;
      }
    });
    setDistribution(dist);*/
  };

  const formatSeconds = () => {
    const hours = Math.floor(secondsTillTomorrow / (60 * 60));
    const minutes = Math.floor((secondsTillTomorrow % (60 * 60)) / 60);
    const seconds = Math.floor(secondsTillTomorrow % 60);

    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <Animated.Text
        entering={SlideInLeft.springify().mass(0.5)}
        style={styles.title}
      >
        {won ? "Congrats!" : "Meh, try again tomorrow"}
      </Animated.Text>

      <Text style={styles.subtitle}>STATISTICS</Text>
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <Number number={played} label={"Played"} />
        <Number number={winRate} label={"Win %"} />
        <Number number={curStreak} label={"Cur streak"} />
        <Number number={maxStreak} label={"Max streak"} />
      </View>

      <Animated.View
        entering={SlideInLeft.delay(200).springify().mass(0.5)}
        style={{ flexDirection: "row", padding: 10 }}
      >
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
            backgroundColor: colors.secondary,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
            Share
          </Text>
        </Pressable>
      </Animated.View>
      <Animated.View
        entering={SlideInLeft.delay(200).springify().mass(0.5)}
        style={{ flexDirection: "row", padding: 10, height: 70 }}
      >
        <Pressable
          onPress={restartGame}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
            New Game
          </Text>
        </Pressable>
      </Animated.View>
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
