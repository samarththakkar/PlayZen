/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fcf4ff',
                    100: '#f8e6ff',
                    200: '#f0caff',
                    300: '#e5a0ff',
                    400: '#d568ff',
                    500: '#c230ff',
                    600: '#ad10f4',
                    700: '#9108ce',
                    800: '#780ca6',
                    900: '#640e85',
                    950: '#41005b',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
