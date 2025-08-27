/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',

		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Montserrat', 'sans-serif'],
			},
			keyframes: {
				rotation: {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				rotationReverse: {
					'0%': { transform: 'rotate(360deg)' },
					'100%': { transform: 'rotate(0deg)' },
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' },
				},
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				pulse0: {
					'0%, 100%': {
						transform: 'scale(1)',
						opacity: '0.05',
					},
					'50%': {
						transform: 'scale(1.05)',
						opacity: '0.2',
					},
				},
				pulse1: {
					'0%, 100%': {
						transform: 'scale(1)',
						opacity: '0.05',
					},
					'50%': {
						transform: 'scale(1.1)',
						opacity: '0.15',
					},
				},
				fadeInUp: {
					from: {
						opacity: '0',
						transform: 'translateY(20px)',
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)',
					},
				},
			},
			animation: {
				'spin-slow': 'rotation 1s linear infinite',
				'spin-slow-reverse': 'rotationReverse 0.5s linear infinite',
				float: 'float 6s ease-in-out infinite',
				fadeIn: 'fadeIn 0.5s ease-out',
				'pulse-0': 'pulse0 2.5s ease-in-out infinite',
				'pulse-1': 'pulse1 2.5s ease-in-out infinite',
				fadeInUp: 'fadeInUp 0.6s ease-out forwards',
			},
			borderWidth: {
				4: '4px',
			},
			colors: {
				neutral: {
					5: '#F9F9F9',
					10: '#F5F5F5',
					20: '#EFEFEF',
					30: '#E8E8E8',
					40: '#E0E0E0',
					50: '#D9D9D9',
					60: '#A6A9AA',
					70: '#939393',
					80: '#121723',
					90: '#313237',
				},
				primary: {
					5: '#F9FBFD',
					10: '#F3F8FF',
					20: '#E4E9F1',
					30: '#C8CED8',
					40: '#8993A4',
					50: '#505F7A',
					60: '#374F76',
					70: '#243858',
					80: '#f0f0f5',
					90: '#1055c4',
				},
				warning: {
					5: '#FFF9F9',
					10: '#F7EFF0',
					20: '#F0E0E1',
					30: '#E4C9CA',
					40: '#D8B2B3',
					50: '#C58B8E',
					60: '#BB777A',
					70: '#B26468',
					80: '#8E5053',
					90: '#6B3C3E',
				},
				success: {
					5: '#F0FDF4',
					10: '#DCFCE7',
					20: '#BBF7D0',
					30: '#86EFAC',
					40: '#4ADE80',
					50: '#22C55E',
					60: '#16A34A',
					70: '#15803D',
					80: '#166534',
					90: '#14532D',
				},
				shades: {
					white: '#FFFFFF',
					black: '#000000',
				},
			},
		},
	},
	plugins: [],
};
