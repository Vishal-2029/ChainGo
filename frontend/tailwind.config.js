/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'blockchain-dark': '#0f172a',
                'blockchain-blue': '#3b82f6',
                'blockchain-green': '#10b981',
            },
        },
    },
    plugins: [],
}
