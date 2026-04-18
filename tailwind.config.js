/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        calm: "0 24px 60px -24px rgba(15, 23, 42, 0.28)",
      },
      colors: {
        sand: "#f7f4ee",
        ink: "#1f2937",
        olive: "#6b7b4f",
      },
    },
  },
  plugins: [],
};
