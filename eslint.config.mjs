import nextConfig from 'eslint-config-next';
import globals from 'globals';

const config = [
    ...nextConfig,
    {
        rules: {
            'react-hooks/set-state-in-effect': 'off',
        },
    },
    {
        files: ['__tests__/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
];

export default config;
