
export const PRODUCTION = process.env.NODE_ENV === 'production';
export const API_URL = PRODUCTION ? "https://api.miraculixx.de" : "http://localhost:8080";
