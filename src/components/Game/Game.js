import React, { useEffect } from "react";
import { useState } from "react";
import {
  Text,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { colors, CLEAR, ENTER } from "../../constants";
import Keyboard from "../Keyboard";
import { WORDS } from "../../words";
import styles from "./Game.styles";
import {
  copyArray,
  getDayOfTheYear,
  getDayKey,
  startNewGame,
} from "../../utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Endscreen from "../EndScreen/EndScreen";
import Animated, {
  SlideInLeft,
  ZoomIn,
  FlipInEasyY,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const NUMBER_OF_TRIES = 6;

const dayOfTheYear = getDayOfTheYear();
const dayKey = getDayKey();

const randomGame = startNewGame();

const testWord = "sugar";

const Game = ({ navigation }) => {
  //AsyncStorage.removeItem("@game");
  //const word = WORDS[dayOfTheYear];
  const word = WORDS[randomGame];
  //const word = testWord;
  const letters = word.split("");

  const [rows, setRows] = useState(
    new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill(""))
  );

  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState("playing"); // won, lost, playing
  const [loaded, setLoaded] = useState(false);
  const [despClue, setDespClue] = useState("");
  const [definition, setDefinition] = useState("");
  const [wordType, setWordType] = useState("");
  const [showEmergencyBtn, setShowEmergencyBtn] = useState(false);

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  }, [curRow]);

  useEffect(() => {
    if (loaded) {
      persistState();
    }
  }, [rows, curRow, curCol, gameState]);

  useEffect(() => {
    readState();
  }, []);

  const persistState = async () => {
    // write all the state variables in AsyncStorage
    const dataForToday = {
      rows,
      curRow,
      curCol,
      gameState,
    };

    try {
      const existingStateString = await AsyncStorage.getItem("@game");
      const existingState = existingStateString
        ? JSON.parse(existingStateString)
        : {};

      existingState[dayKey] = dataForToday;

      const dataString = JSON.stringify(existingState);
      console.log("Saving", dataString);
      await AsyncStorage.setItem("@game", dataString);
    } catch (e) {
      console.log("Failed to write data to Async Storage: ", e);
    }
  };

  const readState = async () => {
    const dataString = await AsyncStorage.getItem("@game");
    try {
      const data = JSON.parse(dataString);
    } catch (e) {
      console.log("Couldn't parse the state.");
    }

    setLoaded(true);
  };

  const checkGameState = () => {
    if (checkIfWon() && gameState != "won") {
      setGameState("won");
      //restartGame();
    } else if (checkIfLost() && gameState != "lost") {
      setGameState("lost");
      //restartGame();
    }
    if (curRow === rows[rows.length - 1]) {
      requestWord;
      setShowEmergencyBtn(true);
    }
  };

  const checkIfWon = () => {
    const row = rows[curRow - 1];
    return row.every((letter, i) => letter === letters[i]);
  };

  const checkIfLost = () => {
    return !checkIfWon() && curRow === rows.length;
  };

  const onKeyPressed = (key) => {
    if (gameState != "playing") {
      return;
    }
    const updateRows = copyArray(rows);

    if (key === CLEAR) {
      const prevCol = curCol - 1;

      if (prevCol >= 0) {
        updateRows[curRow][prevCol] = "";
        setRows(updateRows);
        setCurCol(prevCol);
      }
      return;
    }

    if (key === ENTER) {
      const row = rows[curRow];
      const input = row.join("");
      if (!WORDS.includes(input)) {
        Alert.alert("Ouch", "This is not a word... press 'Clear' to retry!");
        return;
      }
      if (curCol === rows[0].length) {
        setCurRow(curRow + 1);
        setCurCol(0);
      }
      return;
    }

    if (curCol < rows[0].length) {
      updateRows[curRow][curCol] = key;
      setRows(updateRows);
      setCurCol(curCol + 1);
    }
  };

  const isCellActive = (row, col) => {
    return row === curRow && col === curCol;
  };

  const getCellBGColor = (row, col) => {
    const letter = rows[row][col];
    let letterPosition = letters.indexOf(letter);

    if (row >= curRow) {
      return colors.black;
    }
    if (letterPosition === -1) {
      return colors.darkgrey;
    } else {
      if (letter === letters[col]) {
        return colors.primary;
      }
      if (letters.includes(letter)) {
        return colors.secondary;
      }
    }
  };

  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBGColor(i, j) === color)
    );
  };
  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const greyCaps = getAllLettersWithColor(colors.darkgrey);

  const getCellStyle = (i, j) => [
    styles.cell,
    {
      borderColor: isCellActive(i, j) ? colors.grey : colors.darkgrey,
      backgroundColor: getCellBGColor(i, j),
    },
  ];

  const requestWord = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const Http = new XMLHttpRequest();
    const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word;
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        const resJson = JSON.parse(Http.response);
        const def = resJson[0].meanings[0].definitions[0].definition;
        const type = resJson[0].meanings[0].partOfSpeech;
        const clue = resJson[0].meanings[0].definitions[0].synonyms;
        setDefinition(def);
        setWordType(type);
        setDespClue(clue);
      }
    };
  };

  if (!loaded) {
    return <ActivityIndicator />;
  }

  if (gameState !== "playing") {
    return (
      <Endscreen
        won={gameState === "won"}
        rows={rows}
        getCellBGColor={getCellBGColor}
      />
    );
  }

  return (
    <>
      <ScrollView style={styles.map}>
        {rows.map((row, i) => (
          <Animated.View
            entering={SlideInLeft.delay(i * 30)}
            key={`row-${i}`}
            style={styles.row}
          >
            {row.map((letter, j) => (
              <>
                {i < curRow && (
                  <Animated.View
                    entering={FlipInEasyY.delay(j * 100)}
                    key={`cell-color-${i}-${j}`}
                    style={getCellStyle(i, j)}
                  >
                    <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                  </Animated.View>
                )}

                {i === curRow && !!letter && (
                  <Animated.View
                    entering={ZoomIn}
                    key={`cell-active-${i}-${j}`}
                    style={getCellStyle(i, j)}
                  >
                    <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                  </Animated.View>
                )}

                {!letter && (
                  <View key={`cell-${i}-${j}`} style={getCellStyle(i, j)}>
                    <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                  </View>
                )}
              </>
            ))}
          </Animated.View>
        ))}
      </ScrollView>

      <Text
        style={{ color: colors.lightgrey, fontSize: 20, fontWeight: "bold" }}
      >
        {wordType}
      </Text>
      <Animated.View
        entering={SlideInLeft.delay(200).springify().mass(0.5)}
        style={{ flexDirection: "row", padding: 10 }}
      >
        {showEmergencyBtn ? (
          <Pressable
            onPress={requestWord}
            style={{
              flex: 1,
              backgroundColor: colors.secondary,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              height: 45,
              width: 120,
            }}
          >
            <Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
              Desperate Clue
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={requestWord}
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            height: 45,
            width: 120,
          }}
        >
          <Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
            Clue
          </Text>
        </Pressable>
      </Animated.View>

      <Keyboard
        onKeyPressed={onKeyPressed}
        greenCaps={greenCaps}
        yellowCaps={yellowCaps}
        greyCaps={greyCaps}
      />
    </>
  );
};

export default Game;
