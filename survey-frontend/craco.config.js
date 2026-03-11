const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: {
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html',
      }),
    ],
  },
  typescript: {
    enableTypeChecking: false, // Отключаем проверку типов в dev режиме для экономии памяти
  },
};
