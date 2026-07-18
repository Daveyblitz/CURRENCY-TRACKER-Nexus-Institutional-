// Base URL for the backend API.
//
// - In local dev, leave VITE_API_BASE unset. Requests go to relative "/api/*"
//   which Vite's dev-server proxy forwards to http://localhost:5000.
// - In production (Vercel), set VITE_API_BASE to the deployed backend origin,
//   e.g. https://currency-tracker-api.onrender.com  (no trailing slash).
const rawBase = import.meta.env.VITE_API_BASE || ''

// Strip any trailing slash so `${API_BASE}/api/...` never double-slashes.
export const API_BASE = rawBase.replace(/\/$/, '')

// Helper for building an API URL from a path that starts with "/api".
export const apiUrl = (path) => `${API_BASE}${path}`
