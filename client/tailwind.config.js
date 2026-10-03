import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1512",
          900: "#101F1A",
          800: "#16281F",
          700: "#203729",
          600: "#2C4736",
        },
        parchment: {
          50: "#FEFCF6",
          100: "#FBF6EA",
          200: "#F3EBD6",
          300: "#E8DCBF",
        },
        brass: {
          400: "#D9AE5C",
          500: "#C99A3E",
          600: "#A87C2C",
        },
        moss: {
          400: "#6E9E82",
          500: "#4F8267",
          600: "#3B6650",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,21,18,0.06), 0 8px 24px -12px rgba(11,21,18,0.25)",
      },
      backgroundImage: {
        "perf-dots":
          "radial-gradient(circle, rgba(11,21,18,0.12) 1px, transparent 1px)",
      },
    },
  },
  plugins: [typography],
};
