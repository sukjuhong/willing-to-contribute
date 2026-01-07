const config = {
  '*': ['npx prettier --write --ignore-unknown'],
  '*.{ts,tsx}': 'npx eslint --fix app/**/*.{ts,tsx}',
  '*.md': ['npx markdownlint --fix'],
};

export default config;
