module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  plugins.push('react-native-worklets/plugin');
  plugins.push([
    'module-resolver',
    {
      root: ['./'],
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
      alias: {
        '@': './',
      },
    },
  ]);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
