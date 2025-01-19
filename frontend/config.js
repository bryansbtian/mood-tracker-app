export const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "/api"
    : "https://mood-tracker-app-server.vercel.app";
