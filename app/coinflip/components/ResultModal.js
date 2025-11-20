import React from "react";
import { Modal, Text, View, TouchableOpacity, StyleSheet } from "react-native";

const ResultModal = ({ visible, onClose, result }) => {
	if (!result) return null;

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View style={styles.modalContainer}>
				<View style={styles.modal}>
					<Text style={styles.title}>{result.won ? "🎉 You Won!" : "😞 You Lost"}</Text>
					<Text style={styles.text}>Coin Side: {result.result}</Text>
					<Text style={styles.text}>
						{result.won ? `You won ₹${result.amount}` : `You lost ₹${result.amount}`}
					</Text>
					<TouchableOpacity style={styles.button} onPress={onClose}>
						<Text style={styles.buttonText}>Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 10,
		alignItems: "center",
	},
	title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
	text: { fontSize: 16, marginBottom: 5 },
	button: {
		marginTop: 15,
		backgroundColor: "#007BFF",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 5,
	},
	buttonText: { color: "#fff", fontWeight: "bold" },
});

export default ResultModal;
