// Was looking on a way to simulate [.env] for mobile, and best way is to put a .env file, and then load it in the app.json file
// SO this is a setup for that
import Constants from "expo-constants";

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl || "http://localhost:3000";
