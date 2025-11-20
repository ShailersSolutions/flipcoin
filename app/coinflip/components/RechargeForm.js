import api from '@/utils/api';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RechargeForm({ onRechargeSubmit }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [rechargeHistory, setRechargeHistory] = useState([]);

  const handleRecharge = async () => {
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      return Alert.alert('Enter a valid amount greater than 0');
    }

    setLoading(true);
    try {
      await api.post('/recharge/request', { amount: parseInt(amount) });
      Alert.alert('Recharge request submitted successfully!');
      setAmount('');
      onRechargeSubmit();
      fetchRechargeHistory(); // refresh history after submission
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to submit recharge request');
    } finally {
      setLoading(false);
    }
  };

  const fetchRechargeHistory = async () => {
    try {
      const res = await api.get('/recharge/history');
      setRechargeHistory(res.data);
    } catch (err) {
      console.error('Error fetching recharge history:', err);
      setRechargeHistory([]);
    }
  };

  useEffect(() => {
    fetchRechargeHistory();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'pending') return 'orange';
    if (status === 'approved') return 'green';
    if (status === 'rejected') return 'red';
    return '#000';
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Enter amount (e.g., 100)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleRecharge}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit Recharge</Text>
        )}
      </TouchableOpacity>

      {rechargeHistory.length > 0 && (
        <View style={styles.historyBox}>
          <Text style={styles.sectionTitle}>My Recharge Requests</Text>
          {rechargeHistory.map((r) => (
            <View key={r._id} style={styles.rechargeRow}>
              <Text>₹{r.amount}</Text>
              <Text style={{ color: getStatusColor(r.status) }}>
                {r.status.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: 'green',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  rechargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
});
