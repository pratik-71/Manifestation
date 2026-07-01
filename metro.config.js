// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const nodeCoreModules = [
  'stream',
  'zlib',
  'crypto',
  'http',
  'https',
  'tls',
  'net',
  'os',
  'path',
  'fs',
  'dgram',
  'dns'
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (nodeCoreModules.includes(moduleName)) {
    return {
      type: 'empty',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
