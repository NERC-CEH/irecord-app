module.exports = {
  main: {
    files: [
      // HTML
      {
        src: 'src/*.html', dest: 'dist/main/',
        expand: true, flatten: true,
      },
      {
        src: 'src/*.json', dest: 'dist/main/',
        expand: true, flatten: true,
      },
      // CSS
      {
        src: 'src/vendor/**/css/*', dest: 'dist/_build/styles/',
        expand: true, flatten: true,
      },
      {
        src: 'dist/_build/vendor/**/css/*', dest: 'dist/_build/styles/',
        expand: true, flatten: true,
      },
      // IMAGES
      {
        src: 'src/vendor/**/images/*', dest: 'dist/main/images/',
        expand: true, flatten: true,
      },
      {
        src: 'dist/_build/vendor/**/images/*', dest: 'dist/main/images/',
        expand: true, flatten: true,
      },
      {
        src: '**', cwd: 'src/images/', dest: 'dist/main/images/',
        expand: true, filter: 'isFile',
      },
      // FONTS
      {
        src: 'src/vendor/fontello/font/*', dest: 'dist/main/font/',
        expand: true, flatten: true,
      },
      // DATA
      {
        src: 'src/data/*.data.json', dest: 'dist/_build/',
        expand: true, flatten: true,
      },
    ],
  },
};
