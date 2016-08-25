module.exports = {
  dist: {
    files: {
      'dist/_build/styles/main.css': 'src/styles/main.scss',
    },
    options: {
      sourcemap: 'none',
      style: 'expanded',
    },
  },
};
