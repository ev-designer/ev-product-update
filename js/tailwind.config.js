tailwind.config = {
    theme: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
        },
        borderRadius: {
            'none': '0',
            'sm': '0',
            DEFAULT: '0',
            'md': '0',
            'lg': '0',
            'xl': '0',
            '2xl': '0',
            '3xl': '0',
            'full': '0',
        },
        extend: {
            colors: {
                brand: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#4a90e2', // Updated Main Blue
                    600: '#2563eb', // Darker Blue (kept as is, or should also be slightly adjusted? user only gave main color. sticking to request)
                    900: '#1e3a8a',
                },
                sidebar: '#ffffff',
                bg: '#f3f4f6', // Light gray background
                text: '#1f2937',
            }
        }
    }
}
