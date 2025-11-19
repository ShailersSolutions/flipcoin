import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split


DATA_PATH = "data/flips.csv"
df = pd.read_csv(DATA_PATH)

X = df[["winRate", "averageBet", "totalRounds"]]
y = df["side"]  


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


model = LogisticRegression()
model.fit(X_train, y_train)


joblib.dump(model, "models/recommender.pkl")
print("✅ Model trained and saved.")
