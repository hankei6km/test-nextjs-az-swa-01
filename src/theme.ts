import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import createBreakpoints from '@material-ui/core/styles/createBreakpoints';

// https://github.com/mui-org/material-ui/blob/dc68f1ae8470a38660e2dd40fba319dcba405784/examples/nextjs/src/theme.js

// https://stackoverflow.com/questions/52472372/responsive-typography-in-material-ui
function pxToRem(value: number) {
  return `${value / 16}rem`;
}
const breakpoints = createBreakpoints({});

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d'
    },
    secondary: {
      light: '#115d56',
      main: '#19857b',
      dark: '#479d95'
    },
    error: {
      main: red.A400
    },
    background: {
      // default: '#fff'
      default: '#303030'
    }
  },
  overrides: {
    // ここで header 用のを操作するのもどうかと思わなくもないが、
    MuiTypography: {
      h6: {
        fontSize: pxToRem(16),
        [breakpoints.up('sm')]: {
          fontSize: pxToRem(18)
        }
      }
    }
  }
});

export default theme;
