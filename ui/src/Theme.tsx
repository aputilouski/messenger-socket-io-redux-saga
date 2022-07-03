import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2979ff',
    },
    secondary: {
      main: '#673ab7',
    },
  },
  // typography: {
  //   // fontFamily: "'Comfortaa', cursive",
  //   // fontSize: 14,
  //   // fontWeightLight: 300,
  //   // fontWeightRegular: 400,
  //   // fontWeightMedium: 500,
  // },
});

const Theme = ({ children }: { children: React.ReactNode }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

export default Theme;
