import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import './styles.scss';

function ImageWithBackground({ src }) {
  return (
    <div className="image-with-background">
      <div style={{ background: `url("${src}")` }} className="image-fill" />
      <div
        style={{ background: `url("${src}")` }}
        className="image-fill-close"
      />
      <img src={src} />
    </div>
  );
}

ImageWithBackground.propTypes = exact({
  src: PropTypes.string.isRequired,
});

export default ImageWithBackground;
