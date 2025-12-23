/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f172a", // slate-900
                surface: "#1e293b", // slate-800
                primary: "#ec4899", // pink-500
                secondary: "#8b5cf6", // violet-500
            }
        },
    },
    plugins: [],
}
