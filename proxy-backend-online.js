const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: 'https://mbo.helioho.st',
    secure: false,
    changeOrigin: true,
    ws: true,
    logLevel: 'debug'
  }
];

module.exports = PROXY_CONFIG;
