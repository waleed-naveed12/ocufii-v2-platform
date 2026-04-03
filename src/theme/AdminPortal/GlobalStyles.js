import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  /* Decimal Font Face Declarations */
  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-thin.ttf') format('truetype');
    font-weight: 100;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-extralight.ttf') format('truetype');
    font-weight: 200;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-light.ttf') format('truetype');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-book.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-medium.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-semibold.ttf') format('truetype');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-bold.otf') format('opentype');
    font-weight: 700;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-black.ttf') format('truetype');
    font-weight: 800;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-extrablack.otf') format('opentype');
    font-weight: 900;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-ultra.ttf') format('truetype');
    font-weight: 950;
    font-style: normal;
  }

  @font-face {
    font-family: 'Decimal';
    src: url('/fonts/decimal-ultra-italic.ttf') format('truetype');
    font-weight: 950;
    font-style: italic;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${({ theme }) => theme.fontFamily.primary}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    font-size: ${({ theme }) => theme.fontSize.md};
    font-weight: ${({ theme }) => theme.fontWeight.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    transition: ${({ theme }) => theme.transitions.normal};
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  button {
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundSecondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};

    &:hover {
      background: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;
