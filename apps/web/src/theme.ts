import { createTheme } from '@mui/material/styles';

/** Centralized Material UI theme with light and dark color schemes driven by CSS variables. */
export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#1f5f8b' },
        secondary: { main: '#6b4fa0' },
        background: { default: '#f6f7f9', paper: '#ffffff' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#7cb8e4' },
        secondary: { main: '#b9a2e6' },
        background: { default: '#0f1419', paper: '#161c23' },
      },
    },
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
});
