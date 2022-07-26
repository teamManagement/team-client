const path = require('path')
module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  framework: '@storybook/react',
  core: {
    builder: 'webpack5'
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
        // {
        //   loader: 'sass-resources-loader'
        //   // options: {
        //   //   resources: [path.resolve(__dirname, '../src/renderer/src/styles/index.scss')]
        //   // }
        // }
      ],
      include: path.resolve(__dirname, '../')
    })
    return config
  }
}
