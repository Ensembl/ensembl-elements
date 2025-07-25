import type { StorybookConfig } from '@storybook/web-components-vite';
 
const config: StorybookConfig = {
  framework: '@storybook/web-components-vite',
  stories: ['../stories/**/*.stories.ts'],
  core: {
    disableTelemetry: true // storybook runs telemetry by default; and one has to explicitly opt out to prevent that
  },
};
 
export default config;