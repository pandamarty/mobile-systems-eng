import React, { useEffect } from "react";
import { useState } from "react";
import { Text, View, Alert, ActivityIndicator } from "react-native";
import { colors, CLEAR, ENTER, colorsToEmoji } from "../../constants";
import Keyboard from "../Keyboard";
import * as Clipboard from "expo-clipboard";
import { WORDS } from "../../words";
import styles from "./Game.styles";
import { copyArray, getDayOfTheYear, getDayKey } from "../../utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Endscreen from "../EndScreen/EndScreen";

const NUMBER_OF_TRIES = 6;

const dayOfTheYear = getDayOfTheYear();
const dayKey = getDayKey();

const testWord = "hello";

/*const game = {
  rows: [[], []],
  curRow: 4,
  curCol: 2,
  gameState: "won",
};*/

const Game = () => {
  //AsyncStorage.removeItem("@game");
  const word = WORDS[dayOfTheYear];
  //const word = testWord;
  const letters = word.split("");

  const [rows, setRows] = useState(
    new Array(NUMBER_OF_TRIES).fill(new Array(letters.length).fill(""))
  );

  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState("playing"); // won, lost, playing
  const [loaded, setLoaded] = useState(false);

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
      const day = data[dayKey];
      setRows(data.rows);
      setCurCol(data.curCol);
      setCurRow(data.curRow);
      setGameState(data.gameState);
    } catch (e) {
      console.log("Couldn't parse the state.");
    }

    setLoaded(true);
  };

  const checkGameState = () => {
    if (checkIfWon() && gameState != "won") {
      Alert.alert("Hurray!!!", "You won!", [
        { text: "Share", onPress: shareScore },
      ]);
      //requestWordDef();
      setGameState("won");
      //restartGame();
    } else if (checkIfLost() && gameState != "lost") {
      Alert.alert("Naw...", "Try again tomorrow :(");
      setGameState("lost");
      //restartGame();
    }
  };

  const shareScore = () => {
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

  const requestWordDef = (word) => {
    const Http = new XMLHttpRequest();
    const url = "https://jsonplaceholder.typicode.com/posts";
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = (e) => {
      console.log(Http.responseText);
    };
  };

  if (!loaded) {
    return <ActivityIndicator />;
  }

  if (gameState !== "playing") {
    return <Endscreen won={gameState === "won"} />;
  }

  return (
    <>
      <View style={styles.map}>
        {rows.map((row, i) => (
          <View key={`row-${i}`} style={styles.row}>
            {row.map((letter, j) => (
              <View
                key={`cell-${i}-${j}`}
                style={[
                  styles.cell,
                  {
                    borderColor: isCellActive(i, j)
                      ? colors.grey
                      : colors.darkgrey,
                    backgroundColor: getCellBGColor(i, j),
                  },
                ]}
              >
                <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

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
