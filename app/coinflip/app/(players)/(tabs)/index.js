// import { playSound } from '@/constants/voice';
import { useSound } from "@/context/SoundContext";
import api from '@/utils/api';
import { getSocket } from '@/utils/socket';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';

import { playSound } from "@/constants/voice";


import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function FlipScreen() {
  const [remainingTime, setRemainingTime] = useState(0);
  const [roundId, setRoundId] = useState(null);
  const [coinFace, setCoinFace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [betSide, setBetSide] = useState('Heads');
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [totalSpinned, setTotalSpinned] = useState(0);
  const [participants, setParticipants] = useState([]);
  const betInfoRef = useRef({ amount: 0, side: '' });


  const rotation = useRef(new Animated.Value(0)).current;
  const infoAnim = useRef(new Animated.Value(0)).current;
  const joinedAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const betSideRef = useRef('');
const betAmountRef = useRef(0);


  const [canBet, setCanBet] = useState(false);
  const [hasBetPlaced, setHasBetPlaced] = useState(false);

  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const { soundOn, toggleSound } = useSound();

  
  

  const socket = getSocket();

  useEffect(() => {
    async function fetchInitial() {
      try {
        const res = await api.get('/wallet/balance');
        if (res.status === 200) setWallet(res.data.balance || 0);
        const bets = await api.get('/bet/mybets');
        if (bets.status === 200) setTotalSpinned(bets.data.totalBets);
      } catch (e) {
        console.error(e);
      }
    }
    fetchInitial();

    socket.on('newRound', ({ roundId, time, joined, participants }) => {
      setRoundId(roundId);
      setRemainingTime(time);
      setCoinFace(null);
      setJoinedCount(joined || 0);
      setCanBet(true);
      setHasBetPlaced(false);

      if (participants) setParticipants(participants);

      Animated.sequence([
        Animated.timing(infoAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(infoAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      playVoice();
    });

    socket.on('timer', seconds => {
      setRemainingTime(seconds);
      if (seconds <= 5) setCanBet(false);
     if (seconds > 0 && soundOn) {
  playSound("tick", soundOn);
}

    });

    socket.on('joinedUpdate', ({ roundId: r, joined, participants: list }) => {
      if (r === roundId) {
        setJoinedCount(joined);
        const newOnes = list.filter(p => !participants.some(old => old.userId === p.userId));
        const animOnes = newOnes.map(p => ({ ...p, animated: true }));
        setParticipants([...participants, ...animOnes]);
        Animated.sequence([
          Animated.timing(joinedAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
          Animated.spring(joinedAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
      }
    });
socket.on('flipResult', ({ result }) => {
  console.log('📩 flipResult received:', result);

  const yourSide = betSideRef.current;
  const yourAmount = betAmountRef.current;

  if (!yourSide || yourAmount <= 0) {
    console.warn('⚠️ Invalid bet data. Skipping result display.');
    return;
  }

  // Start animation
  animateCoinFlip();
  
  // Delay to let animation complete first
  setTimeout(() => {
    setCoinFace(result);

    const win = result.toUpperCase() === yourSide.toUpperCase();
    const winAmt = yourAmount * 2;

    if (win) {
      setWallet(w => w + winAmt);
    
   playSound("win", soundOn); // ✅ Correct


  

      setShowConfetti(true);

      setResultMessage(`🎉 You Won ₹${winAmt}`);
    } else {
      playSound("loss",soundOn);
      setResultMessage(`😢 You Lost ₹${yourAmount}`);
    }

    setShowResultModal(true);

    // Hold modal + confetti for full 4 seconds
    setTimeout(() => {
      setShowResultModal(false);
      setShowConfetti(false);
      setResultMessage('');
    }, 4000);

    setTotalSpinned(s => s + 1);
  }, 1200); // Animation delay
});


    socket.on('roundCancelled', ({ reason }) => {
      Alert.alert('Round Cancelled', reason);
      setRemainingTime(0);
      setCoinFace(null);
    });

    return () => {
      socket.off('newRound');
      socket.off('timer');
      socket.off('joinedUpdate');
      socket.off('flipResult');
      socket.off('roundCancelled');
    };
  }, [betSide, betAmount, roundId, participants]);

const animateCoinFlip = () => {
  console.log("🔁 Starting coin animation...");
  rotation.setValue(0);
  opacityAnim.setValue(1);

  // ✅ Play flip sound here
  playSound("flip",soundOn);

  Animated.parallel([
    Animated.timing(rotation, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]),
  ]).start();
};


const rotateInterpolate = rotation.interpolate({
  inputRange: [0, 0.5, 1, 1.5, 2],
  outputRange: ['0deg', '180deg', '360deg', '540deg', '720deg'],
});

  const playVoice = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg' },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate(s => s.didJustFinish && sound.unloadAsync());
    } catch (e) {
      console.error(e);
    }
  };





const handleBet = async () => {
  const amt = parseInt(betAmount);
  if (!amt || amt <= 0) return Alert.alert('Enter valid amount');
  if (amt > wallet) return Alert.alert('Not enough funds');

  setLoading(true);
  try {
    const res = await api.post(`/flip-round/bet/${roundId}`, { betAmount: amt, side: betSide });
    if (res.status === 200) {
      setHasBetPlaced(true);
      setWallet(w => w - amt);
      setModalVisible(false);
      setBetAmount('');
      betSideRef.current = betSide;
      betAmountRef.current = amt;
    } else Alert.alert(res.data.error || 'Bet failed');
  } catch (e) {
    console.error(e);
    Alert.alert('Something went wrong');
  } finally {
    setLoading(false);
  }
};


  const showFace = coinFace || 'Heads';

  return (
    
    <ImageBackground source={require('../../../assets/images/Background.png')} style={styles.background}>
      {showConfetti && (
       <LottieView
  source={require('../../../assets/lottie/Confetti.json')}
  autoPlay
  loop={false}
  speed={0.5} // slower speed
  style={styles.confetti}
/>

      )}
 <SafeAreaView style={styles.container}>
      <View style={styles.fullScreenOverlay}>

<TouchableOpacity onPress={toggleSound} style={{ position: 'absolute', top: 50, right: 20 }}>
  <Ionicons name={soundOn ? "volume-high" : "volume-mute"} size={26} color="#fff" />
</TouchableOpacity>

        <Animated.Text style={[styles.infoText, { opacity: infoAnim }]}> New round started! Place your bet</Animated.Text>

        <View style={styles.timerWrap}>
          <Text style={styles.timerText}>
            NEXT COIN FLIP IN <Text style={{ color: 'lime' }}>{remainingTime} sec.</Text>
          </Text>
        </View>

        <View style={styles.machineContainer}>
          <Animated.View style={[styles.coinImageWrap, { transform: [{ rotateY: rotateInterpolate }], opacity: opacityAnim }]}>
            <Image
              source={showFace === 'Heads' ? require('../../../assets/images/heads.png') : require('../../../assets/images/tail.png')}
              style={styles.coinImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.coinResult}>{showFace}</Text>
          <Animated.Text style={[styles.bottomText, { transform: [{ scale: joinedAnim }] }]}>
            Spinned: {totalSpinned} | Joined {joinedCount}
          </Animated.Text>
        </View>

        <TouchableOpacity
          style={[styles.betButton, (!canBet || hasBetPlaced) && styles.betButtonDisabled]}
          onPress={() => (!canBet || hasBetPlaced ? Alert.alert('Bet Locked') : setModalVisible(true))}
        >
          <Text style={styles.betButtonText}>BET NOW</Text>
        </TouchableOpacity>

       
        {/* Bet Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Place your bet</Text>
              <View style={styles.optionRow}>
                {['Heads', 'Tails'].map(side => (
                  <TouchableOpacity
                    key={side}
                    onPress={() => setBetSide(side)}
                    style={[styles.sideButton, betSide === side && styles.activeSide]}
                  >
                    <Text style={{ color: betSide === side ? '#fff' : '#000' }}>{side}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput value={betAmount} onChangeText={setBetAmount} style={styles.input} placeholder="₹ Amount" keyboardType="numeric" />
              <TouchableOpacity onPress={handleBet} style={styles.confirmBtn} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm Bet</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
                <Text style={{ color: 'red' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Result Modal */}
        <Modal visible={showResultModal} transparent animationType="fade">
          <View style={styles.resultOverlay}>
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{resultMessage}</Text>
              <Text style={{ fontSize: 10, color: 'gray' }}>✅ Modal Reached</Text>
            </View>
          </View>
        </Modal>
      </View>
      </SafeAreaView>
    </ImageBackground>
  );
}



const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  
  background: {
    flex: 1,
    resizeMode: 'cover',
  },

  fullScreenOverlay: {
    flex: 1,
    paddingTop: height * 0.07, // ~60 px relative
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoText: {
    fontSize: width * 0.045,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: width * 0.02,
    borderRadius: 10,
  },

  timerWrap: {
    paddingVertical: height * 0.01,
  },

  timerText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },

  machineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.05,
  },

  coinImageWrap: {
    width: width * 0.35,
    height: width * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  coinImage: {
    width: width * 0.27,
    height: width * 0.27,
  },

  coinResult: {
    fontSize: width * 0.05,
    color: '#fff',
  },

  bottomText: {
    marginTop: height * 0.12,
    fontSize: width * 0.04,
    color: '#eee',
  },

  betButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    marginBottom: height * 0.05,
    marginVertical: height * 0.025,
  },

  betButtonDisabled: {
    opacity: 0.5,
  },

  betButtonText: {
    fontSize: width * 0.045,
    color: '#00ff00',
    fontWeight: 'bold',
  },

  chipsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    paddingBottom: height * 0.03,
  },

  chipColumn: {
    alignItems: 'center',
  },

  sideLabel: {
    color: '#fff',
    fontSize: width * 0.04,
    marginBottom: height * 0.007,
    fontWeight: 'bold',
  },

  chip: {
    color: '#fff',
    fontSize: width * 0.035,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    padding: width * 0.05,
    borderRadius: 15,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
  },

  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: height * 0.015,
    width: '100%',
  },

  sideButton: {
    flex: 1,
    padding: height * 0.015,
    marginHorizontal: width * 0.015,
    backgroundColor: '#eee',
    borderRadius: 10,
    alignItems: 'center',
  },

  activeSide: {
    backgroundColor: '#4CAF50',
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: height * 0.015,
    marginTop: height * 0.01,
    marginBottom: height * 0.02,
    fontSize: width * 0.04,
  },

  confirmBtn: {
    backgroundColor: '#28a745',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },

  confirmText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },

  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resultBox: {
    backgroundColor: '#fff',
    padding: width * 0.06,
    borderRadius: 20,
    alignItems: 'center',
  },

  resultText: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  confetti: {
    position: 'absolute',
    top: 0,
    width,
    height,
    zIndex: 5,
  },
});



// // ✅ Updated FlipScreen.js - fully synced with your backend

// import api from '@/utils/api';
// import { getSocket } from '@/utils/socket';
// import { Audio } from 'expo-av';
// import React, { useEffect, useRef, useState } from 'react';

// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Easing,
//   ImageBackground,
//   Modal,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// export default function FlipScreen() {
//   const [remainingTime, setRemainingTime] = useState(0);
//   const [roundId, setRoundId] = useState(null);
//   const [coinFace, setCoinFace] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [betSide, setBetSide] = useState("Heads");
//   const [betAmount, setBetAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [wallet, setWallet] = useState(0);
//   const [joinedCount, setJoinedCount] = useState(0);
//   const [totalSpinned, setTotalSpinned] = useState(0);
//   const rotation = useRef(new Animated.Value(0)).current;
//   const [participants, setParticipants] = useState([]);
  
// const [infoMessage, setInfoMessage] = useState("");
// const joinedAnim = useRef(new Animated.Value(1)).current;
// const [canBet, setCanBet] = useState(false);
// const [hasBetPlaced, setHasBetPlaced] = useState(false);
// const [showConfetti, setShowConfetti] = useState(false);

// const infoAnim = useRef(new Animated.Value(0)).current;



  
//   const socket = getSocket();

//  useEffect(() => {
//   const fetchWallet = async () => {
//     try {
//       const res = await api.get("/wallet/balance");
//       if (res.status === 200) setWallet(res.data.balance || 0);
//     } catch (e) {
//       console.error("Wallet fetch error", e);
//     }
//   };


//   const fetchTotalBets = async () => {
//     try {
//       const res = await api.get('/bet/mybets'); // ✅ backend will use req.user._id
//       if (res.status === 200) {
//         setTotalSpinned(res.data.totalBets);  // ✅ user's total bets
//       }
//     } catch (err) {
//       console.error("Error fetching total bets:", err);
//     }
//   };

//   fetchWallet();
//   fetchTotalBets();
// socket.on("newRound", ({ roundId, time, joined, participants }) => {
//   setRoundId(roundId);
//   setRemainingTime(time);
//   setCoinFace(null);
//   setJoinedCount(joined || 0);
//   setCanBet(true);
//   setHasBetPlaced(false);

//   if (participants) {
//     setParticipants(participants);
//   }

//   setInfoMessage(" New round started! Place your bet");
//   Animated.sequence([
//     Animated.timing(infoAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
//     Animated.delay(2000),
//     Animated.timing(infoAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
//   ]).start();

//   playVoice();
// });

// socket.on("timer", (seconds) => {
//   setRemainingTime(seconds);
//   if (seconds <= 3) setCanBet(false);
// });

// socket.on("joinedUpdate", ({ roundId: rId, joined, participants: updatedList }) => {
//   if (rId === roundId) {
//     setJoinedCount(joined);

//     const newOnes = updatedList.filter(
//       (p) => !participants.some((oldP) => oldP.userId === p.userId)
//     );

//     const animatedNewOnes = newOnes.map((p) => ({ ...p, animated: true }));
//     const merged = [...participants, ...animatedNewOnes];

//     setParticipants(merged);

//     // 🔥 Bounce animation
//     Animated.sequence([
//       Animated.timing(joinedAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
//       Animated.spring(joinedAnim, { toValue: 1, useNativeDriver: true }),
//     ]).start();
//   }
// });



// socket.on("flipResult", ({ result }) => {
//   animateCoinFlip();

//   setTimeout(() => {
//     const resultText = result.toUpperCase();
//     setCoinFace(resultText);
//     playSound(win ? "win" : "loss");


//     const win = resultText === betSide.toUpperCase();
//     const winAmount = parseInt(betAmount) * 2;

//     if (win) {
//       setResultMessage(`🎉 You Won ₹${winAmount}`);
//       setWallet((prev) => prev + winAmount);
//     } else {
//       setResultMessage(`😢 You Lost ₹${betAmount}`);
//     }

//     setShowResultModal(true);

//     // 👇 Automatically hide after 3 seconds
//     setTimeout(() => {
//       setShowResultModal(false);
//       setResultMessage(null);
//     }, 3000);

//     setTotalSpinned((prev) => prev + 1);
//   }, 1200); // after coin flip animation
// });


//   socket.on("roundCancelled", ({ reason }) => {
//     Alert.alert("Round Cancelled", reason);
//     setRemainingTime(0);
//     setCoinFace(null);
//   });

//   return () => {
//     socket.off("newRound");
//     socket.off("timer");
//     socket.off("joinedUpdate");
//     socket.off("flipResult");
//     socket.off("roundCancelled");
//   };
// }, [betSide, betAmount,roundId,participants]);


//   const animateCoinFlip = () => {
//     rotation.setValue(0);
//     Animated.timing(rotation, {
//       toValue: 1,
//       duration: 800,
//       easing: Easing.linear,
//       useNativeDriver: true,
//     }).start();
//   };

//   const rotateInterpolate = rotation.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '720deg']
//   });

// const playVoice = async () => {
//   try {
//     const { sound } = await Audio.Sound.createAsync(
//       { uri: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg" }, // or any soft "start" sound
//       { shouldPlay: true }
//     );
//     sound.setOnPlaybackStatusUpdate((status) => {
//       if (status.didJustFinish) sound.unloadAsync();
//     });
//   } catch (e) {
//     console.error("Voice error:", e);
//   }
// };

// const playSound = async (type = "flip") => {
//   let uri = type === "win"
//     ? "https://example.com/win.mp3"
//     : type === "loss"
//     ? "https://example.com/loss.mp3"
//     : "https://media.geeksforgeeks.org/wp-content/uploads/20250524122236583887/coin-flip-audio.mp3";

//   try {
//     const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
//     sound.setOnPlaybackStatusUpdate((status) => {
//       if (status.didJustFinish) sound.unloadAsync();
//     });
//   } catch (e) {
//     console.error("Audio error:", e);
//   }
// };

// const handleBet = async () => {
//   if (!canBet || hasBetPlaced) {
//     Alert.alert("Please wait", "⏳ Bet already placed or not allowed this round");
//     return;
//   }

//   if (!betAmount || isNaN(betAmount) || betAmount <= 0)
//     return alert("Enter valid amount");

//   if (parseInt(betAmount) > wallet)
//     return alert("Not enough funds in your wallet. Top up to join the excitement!");

//   setLoading(true);
//   try {
//     const res = await api.post(`/flip-round/bet/${roundId}`, {
//       betAmount: parseInt(betAmount),
//       side: betSide,
//     });

//     if (res.status === 200) {
//       setModalVisible(false);
//       setHasBetPlaced(true); // ✅ lock bet
//       setWallet((prev) => prev - parseInt(betAmount));
//       setBetAmount('');
//     } else {
//       alert(res.data?.error || "Bet failed");
//     }
//   } catch (err) {
//     console.error("Bet error:", err.message);
//     alert("Something went wrong!");
//   } finally {
//     setLoading(false);
//   }
// };


//   const showFace = coinFace || "Heads";

//   return (
    
//     <ImageBackground
//       source={require('../../../assets/images/Background.png')}
//       style={styles.background}
//       resizeMode="cover"
//     >
//       <View style={styles.fullScreenOverlay}>
//         <View style={styles.timerWrap}>
//           <Text style={styles.timerText}>NEXT COIN FLIP IN <Text style={{ color: "lime" }}>{remainingTime} sec.</Text></Text>
//         </View>
   

//         <View style={styles.machineContainer}>
//         {infoMessage ? (
//   <Animated.Text
//     style={{
//       opacity: infoAnim,
//       color: "#fff",
//       fontSize: 16,
//       fontWeight: "bold",
//       marginBottom: 10,
//       transform: [{ scale: infoAnim }],
//     }}
//   >
//     {infoMessage}
//   </Animated.Text>
// ) : null}


//           <Animated.Image
//             source={
//               showFace === "Heads"
//                 ? require('../../../assets/images/heads.png')
//                 : require('../../../assets/images/tail.png')
//             }
//             style={[styles.coinImage, { transform: [{ rotateY: rotateInterpolate }] }]}
//           />
//           <Text style={styles.coinResult}>{showFace}</Text>
//          <Animated.Text style={[styles.bottomText, { transform: [{ scale: joinedAnim }] }]}>
//   Spinned: {totalSpinned} | Joined {joinedCount}
// </Animated.Text>

//         </View>
        
       
// <TouchableOpacity
//   style={[
//     styles.betButton,
//     (!canBet || hasBetPlaced) && { backgroundColor: 'gray' },
//   ]}
//   onPress={() => {
//     if (!canBet || hasBetPlaced) {
//       Alert.alert("Bet Locked", "Please wait for the next round.");
//     } else {
//       setModalVisible(true);
//     }
//   }}
// >
//   <Text style={styles.betButtonText}>BET NOW</Text>
// </TouchableOpacity>

//       </View>

//       <Modal visible={modalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <Text style={styles.modalTitle}>Place your bet</Text>
//             <View style={styles.optionRow}>
//               {['Heads', 'Tails'].map((side) => (
//                 <TouchableOpacity
//                   key={side}
//                   onPress={() => setBetSide(side)}
//                   style={[styles.sideButton, betSide === side && styles.activeSide]}
//                 >
//                   <Text style={{ color: betSide === side ? '#fff' : '#000' }}>{side}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter amount"
//               keyboardType="numeric"
//               value={betAmount}
//               onChangeText={setBetAmount}
//             />
//             <TouchableOpacity style={styles.confirmBtn} onPress={handleBet} disabled={loading}>
//               {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm Bet</Text>}
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setModalVisible(false)}>
//               <Text style={{ marginTop: 10, color: "red" }}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   background: { flex: 1 },
//   fullScreenOverlay: { flex: 1, alignItems: 'center', position: 'relative' },
//   timerWrap: { position: 'absolute', top: 110, zIndex: 5, backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
//   timerText: { fontSize: 15, fontWeight: 'bold', color: 'white' },
//   machineContainer: { marginTop: 160, alignItems: 'center', width: '100%' },
//   coinImage: { width: 80, height: 80, marginTop: 28 },
//   coinResult: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 5 },
//   betButton: { position: 'absolute', top: 338, paddingHorizontal: 105, paddingVertical: 14, borderRadius: 30, backgroundColor: '#FFD700' },
//   betButtonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
//   bottomText: { marginTop: 164, color: '#fff', fontSize: 13 },
//   modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
//   modalBox: { backgroundColor: '#fff', padding: 20, width: 300, borderRadius: 10, alignItems: 'center' },
//   modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//   optionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginVertical: 10 },
//   sideButton: { padding: 10, backgroundColor: '#eee', borderRadius: 8, width: '45%', alignItems: 'center' },
//   activeSide: { backgroundColor: '#00f' },
//   input: { width: '100%', padding: 10, borderWidth: 1, borderRadius: 8, marginTop: 10, marginBottom: 10 },
//   confirmBtn: { backgroundColor: 'green', padding: 10, borderRadius: 8, width: '100%', alignItems: 'center' },
//   resultOverlay: {
//   flex: 1,
//   backgroundColor: 'rgba(0,0,0,0.7)',
//   alignItems: 'center',
//   justifyContent: 'center',
// },

// resultBox: {
//   backgroundColor: '#1a1a1a',
//   padding: 30,
//   borderRadius: 20,
//   borderWidth: 2,
//   borderColor: '#fff',
// },

// resultText: {
//   fontSize: 24,
//   fontWeight: 'bold',
//   color: 'lime',
//   textAlign: 'center',
// },

// //   bottomText: {
// //   fontSize: 16,
// //   color: "#fff",
// //   marginTop: 10,
// //   fontWeight: "600",
// // },

//   confirmText: { color: '#fff', fontWeight: 'bold' },
// });




// // Enhanced FlipScreen.js with wallet recharge, dropdown bets, and dynamic result logic
// import api from '@/utils/api';
// import { getSocket } from '@/utils/socket';
// import { Picker } from '@react-native-picker/picker';
// import { Audio } from 'expo-av';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Easing,
//   FlatList,
//   ImageBackground,
//   Linking,
//   Modal,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';

// export default function FlipScreen() {
//   const [remainingTime, setRemainingTime] = useState(0);
//   const [roundId, setRoundId] = useState(null);
//   const [coinFace, setCoinFace] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [walletModal, setWalletModal] = useState(false);
//   const [betSide, setBetSide] = useState("Heads");
//   const [betAmount, setBetAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [wallet, setWallet] = useState(0);
//   const [totalSpinned, setTotalSpinned] = useState(0);
//   const [joinedCount, setJoinedCount] = useState(0);
//   const [transactions, setTransactions] = useState([]);
//   const rotation = useRef(new Animated.Value(0)).current;
//   const intervalRef = useRef(null);
//   const socket = getSocket();

//   useEffect(() => {
//     const fetchWallet = async () => {
//       try {
//         const res = await api.get("/wallet/balance");
//         if (res.status === 200) setWallet(res.data.balance || 0);
//       } catch (e) {
//         console.error("Wallet fetch error", e);
//       }
//     };
//     fetchWallet();

//     socket.on("round-started", ({ roundId, endsAt, joined }) => {
//       const end = new Date(endsAt).getTime();
//       const updateTimer = () => {
//         const now = Date.now();
//         const diff = Math.max(Math.floor((end - now) / 1000), 0);
//         setRemainingTime(diff);
//         if (diff <= 0) clearInterval(intervalRef.current);
//       };
//       updateTimer();
//       intervalRef.current = setInterval(updateTimer, 1000);
//       setRoundId(roundId);
//       setCoinFace(null);
//       setJoinedCount(joined || 0);
//     });

//     socket.on("round-resolved", async ({ resultSide, totalSpinned }) => {
//       animateCoinFlip();
//       setTimeout(() => {
//         setCoinFace(resultSide.toUpperCase());
//         playSound();
//         setTotalSpinned(totalSpinned || 0);
//         if (betSide === resultSide.toUpperCase()) {
//           Alert.alert("🎉 You Won!", `Amount added to wallet: ₹${parseInt(betAmount) * 2}`);
//           setWallet(prev => prev + parseInt(betAmount) * 2);
//         }
//       }, 1000);
//     });

//     return () => {
//       clearInterval(intervalRef.current);
//       socket.off("round-started");
//       socket.off("round-resolved");
//     };
//   }, [betSide, betAmount]);

//   const fetchTransactionHistory = async () => {
//     try {
//       const res = await api.get('/wallet/history');
//       if (res.status === 200) setTransactions(res.data);
//     } catch (err) {
//       console.error("Fetch history failed", err);
//     }
//   };

//   const animateCoinFlip = () => {
//     rotation.setValue(0);
//     Animated.timing(rotation, {
//       toValue: 1,
//       duration: 800,
//       easing: Easing.linear,
//       useNativeDriver: true,
//     }).start();
//   };

//   const rotateInterpolate = rotation.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '720deg']
//   });

//   const playSound = async () => {
//     try {
//       const { sound } = await Audio.Sound.createAsync(
//         { uri: "https://media.geeksforgeeks.org/wp-content/uploads/20250524122236583887/coin-flip-audio.mp3" },
//         { shouldPlay: true }
//       );
//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.didJustFinish) sound.unloadAsync();
//       });
//     } catch (e) {
//       console.error("Audio error:", e);
//     }
//   };

//   const handleBet = async () => {
//     if (!betAmount || isNaN(betAmount) || betAmount <= 0) return alert("Enter valid amount");
//     if (parseInt(betAmount) > wallet) return alert("Insufficient wallet balance! Please recharge.");

//     setLoading(true);
//     try {
//       const res = await api.post('/flip-round/bet', {
//         roundId,
//         betAmount: parseInt(betAmount),
//         side: betSide
//       });
//       if (res.status === 200) {
//         setModalVisible(false);
//         setBetAmount('');
//         setWallet(prev => prev - parseInt(betAmount));
//       } else {
//         alert(res.data?.error || "Bet failed");
//       }
//     } catch (err) {
//       console.error("Bet error:", err.message);
//       alert("Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showFace = coinFace || "Heads";

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/Background.png')}
//       style={styles.background}
//       resizeMode="cover"
//     >
//       <View style={styles.fullScreenOverlay}>
//         <View style={styles.timerWrap}>
//           <Text style={styles.timerText}>NEXT COIN FLIP IN <Text style={{ color: "lime" }}>{remainingTime} sec.</Text></Text>
//         </View>

//         <View style={styles.machineContainer}>
//           <Animated.Image
//             source={
//               showFace === "Heads"
//                 ? require('../../../assets/images/Headss.png')
//                 : require('../../../assets/images/tail.png')
//             }
//             style={[styles.coinImage, { transform: [{ rotateY: rotateInterpolate }] }]}
//           />

//           <Text style={styles.coinResult}>{showFace}</Text>
//           <Text style={styles.bottomText}>Total Spinned - {totalSpinned} | Joined {joinedCount} 🔄</Text>
//           <TouchableOpacity onPress={() => {
//             fetchTransactionHistory();
//             setWalletModal(true);
//           }}>
//             <Text style={{ color: 'yellow', marginTop: 12 }}>💼 Wallet: ₹{wallet} (Recharge & History)</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.betButton} onPress={() => setModalVisible(true)}>
//           <Text style={styles.betButtonText}>BET NOW</Text>
//         </TouchableOpacity>
//       </View>

//       <Modal visible={modalVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalBox}>
//             <Text style={{ fontSize: 16, marginBottom: 10 }}>Wallet: ₹{wallet}</Text>
//             <Text style={styles.modalTitle}>Place your bet</Text>
//             <View style={styles.optionRow}>
//               {['Heads', 'TAIL'].map((side) => (
//                 <TouchableOpacity
//                   key={side}
//                   onPress={() => setBetSide(side)}
//                   style={[styles.sideButton, betSide === side && styles.activeSide]}
//                 >
//                   <Text style={{ color: betSide === side ? '#fff' : '#000' }}>{side}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Picker
//               selectedValue={betAmount}
//               onValueChange={(value) => setBetAmount(value)}
//               style={{ width: '100%', marginVertical: 10 }}
//             >
//               <Picker.Item label="Choose amount" value="" />
//               <Picker.Item label="₹10" value="10" />
//               <Picker.Item label="₹50" value="50" />
//               <Picker.Item label="₹100" value="100" />
//               <Picker.Item label="₹500" value="500" />
//             </Picker>

//             <TouchableOpacity style={styles.confirmBtn} onPress={handleBet} disabled={loading}>
//               {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm Bet</Text>}
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setModalVisible(false)}>
//               <Text style={{ marginTop: 10, color: "red" }}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Wallet Modal */}
//       <Modal visible={walletModal} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={[styles.modalBox, { maxHeight: 400 }]}>            
//             <Text style={styles.modalTitle}>Wallet History</Text>
//             <FlatList
//               data={transactions.slice(0, 5)}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={({ item }) => (
//                 <Text style={{ marginBottom: 5 }}>
//                   [{item.type}] ₹{item.amount} ({item.status})
//                 </Text>
//               )}
//             />
//             <TouchableOpacity onPress={() => Linking.openURL('/wallet-full-history')}> {/* Replace with your screen navigation */}
//               <Text style={{ color: 'blue', marginTop: 10 }}>See More</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setWalletModal(false)}>
//               <Text style={{ color: 'red', marginTop: 10 }}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//   },
//   fullScreenOverlay: {
//     flex: 1,
//     alignItems: 'center',
//     paddingTop: 0,
//     position: 'relative'
//   },
//   timerWrap: {
//     position: 'absolute',
//     top: 110,
//     zIndex: 5,
//     backgroundColor: '#000',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   timerText: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'white'
//   },
//   machineContainer: {
//     marginTop: 160,
//     alignItems: 'center',
//     width: '100%',
//     position: 'relative',
//   },
//   coinImage: {
//     width: 80,
//     height: 80,
//     marginTop: 28,
//   },
//   coinResult: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginTop: 5,
//   },
//   betButton: {
//     position: 'absolute',
//     top: 338,
//     paddingHorizontal: 105,
//     paddingVertical: 14,
//     borderRadius: 30,
//     zIndex: 10,
//     alignSelf: 'flex-start',
//   },
//   betButtonText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   bottomText: {
//     marginTop: 164,
//     color: '#fff',
//     fontSize: 13,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: '#000000aa',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalBox: {
//     backgroundColor: '#fff',
//     padding: 20,
//     width: 300,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   optionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginVertical: 10,
//   },
//   sideButton: {
//     padding: 10,
//     backgroundColor: '#eee',
//     borderRadius: 8,
//     width: '45%',
//     alignItems: 'center',
//   },
//   activeSide: {
//     backgroundColor: '#00f',
//   },
//   input: {
//     width: '100%',
//     padding: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   confirmBtn: {
//     backgroundColor: 'green',
//     padding: 10,
//     borderRadius: 8,
//     width: '100%',
//     alignItems: 'center',
//   },
//   confirmText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });



// // File: app/(tabs)/index.js
// import { Audio } from "expo-av";
// import React, { useContext, useEffect, useState } from "react";
// import { Animated, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { toast } from "react-toastify";

// import { AuthContext } from "@/context/AuthContext";
// import api from "../../../utils/api";
// import { getSocket } from "../../../utils/socket"; // ✅

// const backgroundImage = require("../../../assets/images/Background.png");
// const HeadssImg = require("../../../assets/images/Headss.png");
// const tailsImg = require("../../../assets/images/tail.png");

// export default function HomeScreen() {
//  const { user, loading} = useContext(AuthContext);

//   const [countdown, setCountdown] = useState(60);
//   const [room, setRoom] = useState(null);
//   const [flipResult, setFlipResult] = useState(null);
//   const [animValue] = useState(new Animated.Value(0));

//   const playSound = async () => {
//     const { sound } = await Audio.Sound.createAsync(
//       { uri: "https://media.geeksforgeeks.org/wp-content/uploads/20250524122236583887/coin-flip-audio.mp3" },
//       { shouldPlay: true }
//     );
//     sound.setOnPlaybackStatusUpdate((status) => {
//       if (status.didJustFinish) sound.unloadAsync();
//     });
//   };

//   const flipCoin = () => {
//     Animated.sequence([
//       Animated.timing(animValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
//       Animated.timing(animValue, { toValue: 0, duration: 0, useNativeDriver: true }),
//     ]).start();
//     playSound();
//   };

//  useEffect(() => {
//   const socket = getSocket();
//   if (!socket) return;

//   socket.on("timer", (val) => setCountdown(val));
//   socket.on("newRoom", ({ roomId }) => setRoom(roomId));
//   socket.on("flipResult", ({ result }) => {
//     setFlipResult(result);
//     flipCoin();
//   });

//   return () => {
//     socket.off("timer");
//     socket.off("newRoom");
//     socket.off("flipResult");
//   };
// }, []);


//   const joinRoom = async (side) => {
//     try {
//       await api.post("/coinflip/join", {
//         roomId: room,
//         userId: user._id,
//         amount: 10,
//         choice: side,
//       });
//       toast.success("Bet placed on " + side);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Join failed");
//     }
//   };

//   return (
//     <ImageBackground source={backgroundImage} style={styles.container}>
//       <Text style={styles.timerText}>Next Flip In: {countdown}s</Text>
//       <Animated.Image
//         source={flipResult === "Headss" ? HeadssImg : tailsImg}
//         style={[styles.coin, {
//           transform: [{ rotateY: animValue.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }]
//         }]}
//       />
//       <View style={styles.btnRow}>
//         <TouchableOpacity style={styles.btn} onPress={() => joinRoom("Headss")}>
//           <Text style={styles.btnText}>Bet on Headss</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.btn} onPress={() => joinRoom("Tails")}>
//           <Text style={styles.btnText}>Bet on Tails</Text>
//         </TouchableOpacity>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center" },
//   timerText: { fontSize: 22, color: "#fff", marginBottom: 20 },
//   coin: { width: 120, height: 120, marginBottom: 20 },
//   btnRow: { flexDirection: "row", gap: 20 },
//   btn: { backgroundColor: "#1e90ff", padding: 12, borderRadius: 10 },
//   btnText: { color: "#fff", fontWeight: "bold" },
// });


// // app/(tabs)/index.js
// import api from "@/utils/api"; // clean and meaningful
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";



// const HomeDashboard = () => {
//   const router = useRouter();
//   const [wallet, setWallet] = useState(0);
//   const [lastFlip, setLastFlip] = useState(null);

//   useEffect(() => {
//     const fetchSummary = async () => {
      

//       try {
//         const walletRes = await api.get("/wallet/balance");
//         setWallet(walletRes.data.balance);

//         const flipRes = await api.get("/coin/last-flip");
//         setLastFlip(flipRes.data);
//       } catch (err) {
//         console.error("Dashboard fetch error:", err);
//       }
//     };

//     fetchSummary();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>👋 Welcome Back!</Text>
//       <Text style={styles.section}>💰 Wallet Balance: ₹{wallet}</Text>

//       {lastFlip ? (
//         <View style={styles.sectionBox}>
//           <Text style={styles.section}>🪙 Last Flip: {lastFlip.outcome}</Text>
//           <Text style={styles.section}>Your Bet: ₹{lastFlip.amount} on {lastFlip.choice}</Text>
//           <Text style={styles.section}>Result: {lastFlip.win ? "✅ You Won" : "❌ You Lost"}</Text>
//         </View>
//       ) : (
//         <Text style={styles.section}>No recent flip.</Text>
//       )}

//       <TouchableOpacity style={styles.button} onPress={() => router.push("/game-room")}>  
//         <Text style={styles.buttonText}>🎮 Start a New Flip</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     backgroundColor: "#f7f7f7",
//     justifyContent: "center",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 30,
//   },
//   section: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   sectionBox: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 20,
//     elevation: 2,
//   },
//   button: {
//     backgroundColor: "#007bff",
//     padding: 15,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// export default HomeDashboard;


// import { useEffect, useState } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing } from "react-native";
// import axios from "axios";

// export default function HomeScreen() {
//   const [coinSide, setCoinSide] = useState("Headss");
//   const [flipAnim] = useState(new Animated.Value(0));
//   const [bettingRound, setBettingRound] = useState(null);

//   const fetchCurrentRound = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/coin/round/current");
//       setBettingRound(res.data);
//     } catch (err) {
//       console.error("Error fetching current round", err);
//     }
//   };

//   const flipCoin = () => {
//     Animated.timing(flipAnim, {
//       toValue: 1,
//       duration: 1000,
//       easing: Easing.bezier(0.68, -0.55, 0.27, 1.55),
//       useNativeDriver: true,
//     }).start(() => {
//       setCoinSide(Math.random() > 0.5 ? "Headss" : "Tails");
//       flipAnim.setValue(0);
//     });
//   };

//   useEffect(() => {
//     fetchCurrentRound();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Current Round #{bettingRound?.roundId || "-"}</Text>

//       <Animated.Image
//         source={{
//           uri:
//             coinSide === "Headss"
//               ? "https://media.geeksforgeeks.org/wp-content/uploads/20250523110516074355/Headss.png"
//               : "https://media.geeksforgeeks.org/wp-content/uploads/20250523110416893474/tail.png",
//         }}
//         style={[
//           styles.coinImage,
//           {
//             transform: [
//               {
//                 rotateY: flipAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: ["0deg", "720deg"],
//                 }),
//               },
//             ],
//           },
//         ]}
//       />

//       <TouchableOpacity style={styles.button} onPress={flipCoin}>
//         <Text style={styles.buttonText}>Flip Coin (Demo)</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 24 },
//   coinImage: { width: 150, height: 150, marginBottom: 24 },
//   button: { backgroundColor: "#007bff", padding: 12, borderRadius: 8 },
//   buttonText: { color: "#fff", fontWeight: "bold" },
// });




// import React, { useState, useContext } from "react";
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing, Image } from "react-native";
// import { AuthContext } from "../../context/AuthContext";
// import { Audio } from "expo-av";
// import axios from "../../utils/api";

// const HomeScreen = () => {
//   const { userToken } = useContext(AuthContext);

//   const [betAmount, setBetAmount] = useState("");
//   const [coinSide, setCoinSide] = useState("Headss");
//   const [result, setResult] = useState(null);
//   const [balance, setBalance] = useState(1000); // You can fetch this from backend
//   const [loading, setLoading] = useState(false);

//   const flipAnim = new Animated.Value(0);

//   const flipCoin = async () => {
//     if (!betAmount || isNaN(betAmount) || Number(betAmount) <= 0) {
//       alert("Enter valid bet amount");
//       return;
//     }

//     if (Number(betAmount) > balance) {
//       alert("Insufficient balance");
//       return;
//     }

//     setLoading(true);

//     // Flip sound
//     try {
//       const { sound } = await Audio.Sound.createAsync(
//         { uri: "https://media.geeksforgeeks.org/wp-content/uploads/20250524122236583887/coin-flip-audio.mp3" },
//         { shouldPlay: true }
//       );
//       sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.didJustFinish) sound.unloadAsync();
//       });
//     } catch (e) {}

//     // Animation
//     Animated.timing(flipAnim, {
//       toValue: 1,
//       duration: 800,
//       easing: Easing.bezier(0.68, -0.55, 0.27, 1.55),
//       useNativeDriver: true,
//     }).start(() => flipAnim.setValue(0));

//     try {
//       const res = await axios.post("/coin/flip", {
//         bet: Number(betAmount),
//         side: coinSide,
//       });

//       setResult(res.data.result); // "win" or "loss"
//       setBalance(res.data.updatedBalance); // new balance from backend
//     } catch (err) {
//       alert("Flip failed");
//     }

//     setLoading(false);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Coin Flip Game</Text>

//       <Text style={styles.balance}>Balance: ₹{balance}</Text>

//       <View style={styles.selector}>
//         <TouchableOpacity
//           style={[styles.option, coinSide === "Headss" && styles.selected]}
//           onPress={() => setCoinSide("Headss")}
//         >
//           <Text style={styles.optionText}>Headss</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.option, coinSide === "Tails" && styles.selected]}
//           onPress={() => setCoinSide("Tails")}
//         >
//           <Text style={styles.optionText}>Tails</Text>
//         </TouchableOpacity>
//       </View>


//       <TextInput
//         placeholder="Enter bet amount"
//         keyboardType="numeric"
//         value={betAmount}
//         onChangeText={setBetAmount}
//         style={styles.input}
//       />

//       <TouchableOpacity style={styles.button} onPress={flipCoin} disabled={loading}>
//         <Text style={styles.buttonText}>{loading ? "Flipping..." : "Flip Coin"}</Text>
//       </TouchableOpacity>

//       {result && (
//         <Text style={[styles.result, result === "win" ? styles.win : styles.loss]}>
//           You {result === "win" ? "won 🎉" : "lost 💸"}!
//         </Text>
//       )}

//       <Animated.Image
//         source={{
//           uri:
//             coinSide === "Headss"
//               ? "https://media.geeksforgeeks.org/wp-content/uploads/20250523110516074355/Headss.png"
//               : "https://media.geeksforgeeks.org/wp-content/uploads/20250523110416893474/tail.png",
//         }}
//         style={[
//           styles.coinImage,
//           {
//             transform: [
//               {
//                 rotateY: flipAnim.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: ["0deg", "720deg"],
//                 }),
//               },
//             ],
//           },
//         ]}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
//   balance: { fontSize: 18, marginBottom: 10 },
//   selector: { flexDirection: "row", marginVertical: 10 },
//   option: {
//     backgroundColor: "#eee",
//     padding: 10,
//     marginHorizontal: 10,
//     borderRadius: 5,
//   },
//   selected: {
//     backgroundColor: "#007bff",
//   },
//   optionText: { color: "#000", fontWeight: "bold" },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     width: "80%",
//     marginVertical: 10,
//     borderRadius: 5,
//   },
//   button: {
//     backgroundColor: "#28a745",
//     padding: 12,
//     borderRadius: 5,
//     marginTop: 10,
//     width: "60%",
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" },
//   result: { marginTop: 20, fontSize: 20, fontWeight: "bold" },
//   win: { color: "green" },
//   loss: { color: "red" },
//   coinImage: {
//     width: 120,
//     height: 120,
//     marginTop: 30,
//   },
// });

// export default HomeScreen;

// // Import necessary hooks and components from React and React Native
// import { useState, useRef } from "react";
// import {
// 	View,                // Container component for layout
// 	Text,                // Component for displaying text
// 	StyleSheet,          // Utility for creating styles
// 	TouchableOpacity,    // Button-like component for touch handling
// 	Animated,            // For animations
// 	Easing,              // For animation easing functions
// } from "react-native";
// import { Audio } from "expo-av";

// // Main App component
// const HomeScreen= () => {
// 	// State to keep track of the current coin side ("Headss" or "Tails")
// 	const [coinSide, setCoinSide] = useState("Headss");
// 	// State to keep track of the number of Headss
// 	const [HeadssCount, setHeadssCount] = useState(0);
// 	// State to keep track of the number of tails
// 	const [tailsCount, setTailsCount] = useState(0);

// 	// Animated value for the coin flip animation
// 	const flipAnimation = useRef(new Animated.Value(0)).current;
// 	// Import Audio from expo-av at the top of your file:
// 	// import { Audio } from "expo-av";

// 	// Function to handle coin flip logic and animation with audio
// 	const flipCoin = async () => {
// 		// Play coin flip audio
// 		try {
// 			const { sound } = await Audio.Sound.createAsync(
// 				{ uri: "https://media.geeksforgeeks.org/wp-content/uploads/20250524122236583887/coin-flip-audio.mp3" },
// 				{ shouldPlay: true }
// 			);
// 			// Unload sound after playback
// 			sound.setOnPlaybackStatusUpdate((status) => {
// 				if (status.didJustFinish) {
// 					sound.unloadAsync();
// 				}
// 			});
// 		} catch (e) {
// 			// Handle audio error silently
// 			console.error("Audio error:", e);
// 		}

// 		// Start the spin: animate rotateY from 0deg to 720deg over 1s with a custom cubic-bezier
// 		Animated.timing(flipAnimation, {
// 			toValue: 2, // 0 -> 720deg (2 * 360deg)
// 			duration: 1000,
// 			easing: Easing.bezier(0.68, -0.55, 0.27, 1.55),
// 			useNativeDriver: true,
// 		}).start();

// 		// Change image at halfway (500ms)
// 		setTimeout(() => {
// 			const randomSide = Math.floor(Math.random() * 2);
// 			if (randomSide === 0) {
// 				setCoinSide("Headss");
// 				setHeadssCount((prev) => prev + 1);
// 			} else {
// 				setCoinSide("Tails");
// 				setTailsCount((prev) => prev + 1);
// 			}
// 		}, 500);

// 		// Reset animation value after animation completes (1s)
// 		setTimeout(() => {
// 			flipAnimation.setValue(0);
// 		}, 1000);
// 	};
// 	// Function to reset both Headss and tails counts
// 	const resetCounts = () => {
// 		setHeadssCount(0);    // Reset Headss count to 0
// 		setTailsCount(0);    // Reset tails count to 0
// 	};

// 	// Render the UI
// 	return (
// 		<View style={styles.container}>
// 			{/* App title */}
// 			<Text style={styles.title}>Coin Flip App</Text>
// 			{/* Coin image container */}
// 			<View style={styles.coinContainer}>
// 				{/* Show the coin image if coinSide is set */}
// 				{coinSide && (
// 					// Animated image for coin flip
// 					<Animated.Image
// 						source={{
// 							// Set image source based on coin side
// 							uri: coinSide === "Headss"
// 								? "https://media.geeksforgeeks.org/wp-content/uploads/20250523110516074355/Headss.png"
// 								: "https://media.geeksforgeeks.org/wp-content/uploads/20250523110416893474/tail.png",
// 						}}
// 						style={[
// 							styles.coinImage,
// 							{
// 								// Apply flip animation using rotateY
// 								transform: [
// 									{
// 										rotateY: flipAnimation.interpolate({
// 											inputRange: [0, 1],  // Input range for interpolation
// 											outputRange: ["0deg", "180deg"],    // Output range for rotation
// 										}),
// 									},
// 								],
// 							},
// 						]}
// 					/>
// 				)}
// 			</View>
// 			<View style={styles.countContainer}>
// 				<View style={styles.count}>
// 					<Text style={styles.countText}>Headss: {HeadssCount}</Text>
// 				</View>
// 				<View style={styles.count}>
// 					<Text style={styles.countText}>Tails: {tailsCount}</Text>
// 				</View>
// 			</View>
// 			{/* Row of buttons for flipping and resetting */}
// 			<View style={styles.buttonRow}>
// 				<TouchableOpacity style={styles.button} onPress={flipCoin}>
// 					<Text style={styles.buttonText}>Flip Coin</Text>
// 				</TouchableOpacity>
// 				<TouchableOpacity style={styles.button} onPress={resetCounts}>
// 					<Text style={styles.buttonText}>Reset</Text>
// 				</TouchableOpacity>
// 			</View>
// 		</View>
// 	);
// };

// // Styles for the components
// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,                   // Take up full screen
// 		alignItems: "center",      // Center items horizontally
// 		justifyContent: "center",  // Center items vertically
// 	},
// 	title: {
// 		fontSize: 24,              // Large font size
// 		fontWeight: "bold",        // Bold text
// 		marginBottom: 20,          // Space below title
// 	},
// 	coinContainer: {
// 		marginBottom: 30,          // Space below coin image
// 	},
// 	coinImage: {
// 		width: 150,                // Coin image width
// 		height: 150,               // Coin image height
// 	},
// 	countContainer: {
// 		flexDirection: "row",      // Arrange counts in a row
// 		marginBottom: 10,          // Space below counts
// 	},
// 	count: {
// 		marginRight: 20,           // Space between counts
// 	},
// 	countText: {
// 		fontSize: 18,              // Font size for counts
// 		fontWeight: "bold",        // Bold text
// 		color: "#007BFF",          // Blue color
// 	},
// 	buttonRow: {
// 		flexDirection: "row",      // Arrange buttons in a row
// 	},
// 	button: {
// 		backgroundColor: "#007BFF",// Button background color
// 		padding: 10,               // Padding inside button
// 		margin: 10,                // Space between buttons
// 		borderRadius: 5,           // Rounded corners
// 	},
// 	buttonText: {
// 		color: "white",            // Button text color
// 		fontWeight: "bold",        // Bold button text
// 	},
// });

// // Export the App component as default
// export default HomeScreen;
