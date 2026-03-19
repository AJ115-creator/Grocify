/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    darkMode: "media", // this tells Tailwind/NativeWind to follow the device color scheme.
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background) / <alpha-value>)",
                foreground: "hsl(var(--foreground) / <alpha-value>)",
                card: "hsl(var(--card) / <alpha-value>)",
                "card-foreground": "hsl(var(--card-foreground) / <alpha-value>)",
                popover: "hsl(var(--popover) / <alpha-value>)",
                "popover-foreground": "hsl(var(--popover-foreground) / <alpha-value>)",
                primary: {
                    DEFAULT: "hsl(var(--primary) / <alpha-value>)",
                    foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
                    foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted) / <alpha-value>)",
                    foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                    foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
                },
                border: "hsl(var(--border) / <alpha-value>)",
                input: "hsl(var(--input) / <alpha-value>)",
                ring: "hsl(var(--ring) / <alpha-value>)",
                success: {
                    DEFAULT: "hsl(var(--success) / <alpha-value>)",
                },
                "chart-1": "hsl(var(--chart-1) / <alpha-value>)",
                "chart-2": "hsl(var(--chart-2) / <alpha-value>)",
                "chart-3": "hsl(var(--chart-3) / <alpha-value>)",
                "chart-4": "hsl(var(--chart-4) / <alpha-value>)",
                "chart-5": "hsl(var(--chart-5) / <alpha-value>)",
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
                    foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
                    primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
                    accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
                    border: "hsl(var(--sidebar-border) / <alpha-value>)",
                    ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
                },
                "priority-low": {
                    DEFAULT: "hsl(var(--priority-low) / <alpha-value>)",
                    foreground: "hsl(var(--priority-low-foreground) / <alpha-value>)",
                },
                "priority-medium": {
                    DEFAULT: "hsl(var(--priority-medium) / <alpha-value>)",
                    foreground: "hsl(var(--priority-medium-foreground) / <alpha-value>)",
                },
                "priority-high": {
                    DEFAULT: "hsl(var(--priority-high) / <alpha-value>)",
                    foreground: "hsl(var(--priority-high-foreground) / <alpha-value>)",
                },
            },
        },
    },
    plugins: [],
};