'use client';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useColorScheme } from '@mui/material/styles';

const MODES = ['system', 'light', 'dark'] as const;
type Mode = (typeof MODES)[number];

function isMode(value: unknown): value is Mode {
  return MODES.some((mode) => mode === value);
}

export function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();

  // The mode is unknown until the client has read the stored preference.
  if (mode === undefined) {
    return null;
  }

  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={mode}
      aria-label="Color scheme"
      onChange={(_event, value: unknown) => {
        if (isMode(value)) {
          setMode(value);
        }
      }}
    >
      {MODES.map((value) => (
        <ToggleButton key={value} value={value} sx={{ textTransform: 'capitalize', px: 1.5 }}>
          {value}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
