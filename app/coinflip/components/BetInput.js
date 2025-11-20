import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const BetInput = ({ betAmount, setBetAmount, userChoice, setUserChoice }) => {
	return (
		<View style={styles.container}>
			<TextInput
				value={betAmount}
				onChangeText={setBetAmount}
				keyboardType="numeric"
				style={styles.input}
				placeholder="Enter Bet ₹"
			/>

			<View style={styles.choices}>
				<TouchableOpacity
					style={[styles.choice, userChoice === "Heads" && styles.selected]}
					onPress={() => setUserChoice("Heads")}
				>
					<Text style={styles.text}>Heads</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.choice, userChoice === "Tails" && styles.selected]}
					onPress={() => setUserChoice("Tails")}
				>
					<Text style={styles.text}>Tails</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { alignItems: "center", marginBottom: 20 },
	input: {
		borderWidth: 1,
		width: 150,
		borderColor: "#ccc",
		padding: 10,
		borderRadius: 5,
		textAlign: "center",
		marginBottom: 10,
	},
	choices: { flexDirection: "row", gap: 10 },
	choice: {
		padding: 10,
		borderRadius: 5,
		backgroundColor: "#f0f0f0",
	},
	selected: { backgroundColor: "#007BFF" },
	text: { color: "#000", fontWeight: "bold" },
});

export default BetInput;
