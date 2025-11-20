import api from '@/utils/api';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/transaction/history');
        setTransactions(res.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <View>
      <Text style={styles.title}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.txRow}>
            <Text style={styles.txText}>{item.type.toUpperCase()} ₹{item.amount}</Text>
            <Text style={{ color: item.status === 'success' ? 'green' : 'red' }}>
              {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  txText: {
    fontSize: 14,
  },
});
