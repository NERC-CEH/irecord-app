module.exports = {
  target: {
    files: [{
      src: [
        'dist/_build/styles/bootstrap.css',
        'dist/_build/styles/ratchet.css',
        'dist/_build/styles/ionic.css',
        'dist/_build/styles/leaflet.css',
        'dist/_build/styles/icons.css',
        'dist/_build/styles/photoswipe.css',
        'dist/_build/styles/default-skin.css',
        'dist/_build/styles/main.css',
      ],
      dest: 'dist/main/main.min.css',
    }],
  },
};
