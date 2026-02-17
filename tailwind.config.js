/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {

        comfortaa: ["Comfortaa_400Regular"],
        "comfortaa-light": ["Comfortaa_300Light"],
        "comfortaa-medium": ["Comfortaa_500Medium"],
        "comfortaa-semibold": ["Comfortaa_600SemiBold"],
        "comfortaa-bold": ["Comfortaa_700Bold"],
      },
    },
  },
  plugins: [],
}
