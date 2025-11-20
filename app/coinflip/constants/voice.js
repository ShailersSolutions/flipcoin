import { Audio } from "expo-av";


// Sound files
const flipSound = require("../assets/audio/flip.mp3");
const winSound = require("../assets/audio/win.mp3");
const lossSound = require("../assets/audio/loss.mp3");
const tickSound = require("../assets/audio/tick.mp3");

export const playSound = async (type = "flip", soundOn = true) => {
  if (!soundOn) return; // ✅ Mute respected here

  let file =
    type === "win"
      ? winSound
      : type === "loss"
      ? lossSound
      : type === "tick"
      ? tickSound
      : flipSound;

  try {
    const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: true });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    console.error("🔇 Audio error:", e);
  }
};

// import { Audio } from "expo-av";

// // Import local sound files
// const flipSound = require("../assets/audio/flip.mp3");
// const winSound = require("../assets/audio/win.mp3");
// const lossSound = require("../assets/audio/loss.mp3");
// cons

// export const playSound = async (type = "flip") => {
//   const soundFile =
//     type === "win"
//       ? winSound
//       : type === "loss"
//       ? lossSound
//       : flipSound;

//   try {
//     const { sound } = await Audio.Sound.createAsync(soundFile, {
//       shouldPlay: true,
//     });

//     sound.setOnPlaybackStatusUpdate((status) => {
//       if (status.didJustFinish) sound.unloadAsync();
//     });
//   } catch (e) {
//     console.error("🎧 Local audio error:", e);
//   }
// };
