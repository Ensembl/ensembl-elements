import type { Preview } from '@storybook/web-components-vite';

// Hide the bottom panel (which is open by default and is used to show "controls" or "actions" tabs)

const preview: Preview = {
  parameters: {
    options: {
      bottomPanelHeight: 0
    }
  }
};

export default preview;