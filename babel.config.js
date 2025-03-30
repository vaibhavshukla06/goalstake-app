module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      'babel-plugin-inline-dotenv',
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            '@app': './app',
            '@components': './components',
            '@constants': './constants',
            '@services': './services',
            '@store': './store',
            '@types': './types',
            '@utils': './utils',
            '@assets': './assets',
          },
        },
      ],
    ],
  };
}; 