/** @type {import("prettier").Config} */
const config = {
  printWidth: 90,
  tabWidth: 2, // Default.
  useTabs: false, // Default.
  semi: true, // Default.
  singleQuote: true,
  quoteProps: 'as-needed', // Default.
  jsxSingleQuote: false, // Default.
  trailingComma: 'all', // Default.
  bracketSpacing: true, // Default.
  bracketSameLine: false, // Default.
  arrowParens: 'avoid',
  proseWrap: 'never',
  htmlWhitespaceSensitivity: 'css', // Default.
  endOfLine: 'lf', // Default.
  singleAttributePerLine: false, // Default.
};

export default config;
