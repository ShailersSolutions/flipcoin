import RechargeForm from '@/components/RechargeForm';
import TransactionHistory from '@/components/TransactionHistory';
import api from '@/utils/api';
import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingRecharges, setPendingRecharges] = useState([]);
 const [rechargeHistory, setRechargeHistory] = useState([]);

  const [showHistory, setShowHistory] = useState(false);


  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet/balance');
      console.log(res.data)
      setBalance(res.data.balance);
    } catch (err) {
      console.error('Wallet fetch error:', err);
    }
  };

  const fetchPendingRecharges = async () => {
    try {
      const res = await api.get('/recharge/pending');
      setPendingRecharges(res.data);
    } catch (err) {
      setPendingRecharges([]);
    }
  };

  

  useEffect(() => {
    fetchWallet();
    fetchPendingRecharges();

  }, []);

  const fetchRechargeHistory = async () => {
  try {
    const res = await api.get('/recharge/history');
    setRechargeHistory(res.data);
  } catch (err) {
    setRechargeHistory([]);
  }
};


  const handleRechargeSubmit = () => {
    fetchPendingRecharges();

    fetchWallet();
    fetchPendingRecharges();
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Wallet Balance: ₹{balance}</Text>

      <TouchableOpacity
  style={styles.rechargeBtn}
  onPress={() => {
    setModalVisible(true);
    fetchRechargeHistory(); // fetch history here
  }}
>
  <Text style={styles.rechargeBtnText}>Recharge Wallet</Text>
</TouchableOpacity>


      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <RechargeForm onRechargeSubmit={handleRechargeSubmit} />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {pendingRecharges.length > 0 && (
        <View style={styles.pendingBox}>
          <Text style={styles.sectionTitle}>Pending Recharges</Text>
          {pendingRecharges.map((r) => (
            <Text key={r._id} style={styles.pendingText}>₹{r.amount} - {r.status.toUpperCase()}</Text>
          ))}
        </View>
      )}

    
<TouchableOpacity
  style={styles.viewHistoryBtn}
  onPress={() => setShowHistory(!showHistory)}
>
  <Text style={styles.viewHistoryBtnText}>
    {showHistory ? 'Hide Transaction History' : 'View Transaction History'}
  </Text>
</TouchableOpacity>

{showHistory && <TransactionHistory />}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },
  pendingBox: {
    marginTop: 10,
    backgroundColor: '#fff4e5',
    padding: 10,
    borderRadius: 8,
  },
  pendingText: {
    color: 'orange',
  },
  historyBox: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  rechargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rechargeBtn: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  rechargeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    width: 300,
    borderRadius: 10,
  },
  cancelText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  viewHistoryBtn: {
  backgroundColor: '#555',
  padding: 10,
  borderRadius: 6,
  alignItems: 'center',
  marginTop: 10,
},
viewHistoryBtnText: {
  color: 'white',
  fontWeight: 'bold',
},

});


// import { useEffect, useState } from "react";
// import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// import api from "../../../utils/api";

// export default function WalletScreen() {
//   const [balance, setBalance] = useState(0);
//   const [amount, setAmount] = useState("");

//   const fetchBalance = async () => {
//     try {
//       const res = await api.get("http://localhost:5000/api/wallet/balance");
//       setBalance(res.data.balance);
//     } catch (err) {
//       console.error("Balance error", err);
//     }
//   };

//   const handleTopUp = async () => {
//     try {
//       if (!amount || isNaN(amount)) return Alert.alert("Invalid Amount");
//       await api.post(
//         "http://localhost:5000/api/wallet/topup",
//         { amount: parseFloat(amount) },
         
//       );
//       setAmount("");
//       fetchBalance();
//     } catch (err) {
//       console.error("Top-up failed", err);
//       Alert.alert("Top-up Failed");
//     }
//   };

//   useEffect(() => {
//     fetchBalance();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Wallet Balance</Text>
//       <Text style={styles.balance}>₹ {balance.toFixed(2)}</Text>

//       <TextInput
//         placeholder="Enter amount"
//         keyboardType="numeric"
//         value={amount}
//         onChangeText={setAmount}
//         style={styles.input}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleTopUp}>
//         <Text style={styles.buttonText}>Top Up Wallet</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
//   balance: { fontSize: 28, color: "green", marginBottom: 30 },
//   input: {
//     width: "100%",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   button: {
//     backgroundColor: "#007bff",
//     padding: 14,
//     borderRadius: 8,
//     width: "100%",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
// });
