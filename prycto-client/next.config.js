const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
  },
  // webpack(config, options) {
  //   const { dev, isServer } = options;

  //   // Do not run type checking twice:
  //   if (dev && isServer) {
  //     config.plugins.push(
  //       new ForkTsCheckerWebpackPlugin()
  //     );
  //   }

  //   return config;
  // },
}