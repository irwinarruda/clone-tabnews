/** @type {import('jest').Config} */
export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	rootDir: '..',
	transform: {
		'^.+\\.svelte$': [
			'svelte-jester',
			{
				preprocess: true
			}
		],
		'^.+\\.[tj]sx?$': [
			'ts-jest',
			{
				useESM: true
			}
		]
	},
	moduleFileExtensions: ['js', 'ts', 'svelte'],
	moduleNameMapper: {
		'^\\$lib(.*)$': '<rootDir>/src/lib$1',
		'^\\$app(.*)$': [
			'<rootDir>/.svelte-kit/dev/runtime/app$1',
			'<rootDir>/.svelte-kit/build/runtime/app$1'
		],
		'^\\$env/dynamic/private': ['<rootDir>/tests/setup/privateEnv.ts'],
		'^~/(.*)$': '<rootDir>$1'
	},
	extensionsToTreatAsEsm: ['.svelte', '.ts']
};
