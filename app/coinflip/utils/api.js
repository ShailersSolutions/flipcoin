
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const api = axios.create({
  baseURL: "http://10.74.120.77:5000/api",
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  console.log("TOKEN FROM INTERCEPTOR", token); // ✅ Add this
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export default api;
