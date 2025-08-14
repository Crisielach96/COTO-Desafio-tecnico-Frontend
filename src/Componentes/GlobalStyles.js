import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    }

body {
    background-color: #b3b3b3ff;
    padding: 20px;
    }
`;

export default GlobalStyles;
