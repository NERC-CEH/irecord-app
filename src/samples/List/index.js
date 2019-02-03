import Log from 'helpers/log';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import radio from 'radio';
import savedSamples from 'saved_samples'; // TODO: should be moved out
import Factory from 'model_factory';
import Sample from './components/Sample';
import UserFeedbackRequest from './components/UserFeedbackRequest';
import './empty-samples-list-icon.svg';
import './styles.scss';

function byDate(a, b) {
  a = new Date(a.metadata.created_on);
  b = new Date(b.metadata.created_on);
  return a > b ? -1 : a < b ? 1 : 0; // eslint-disable-line
}
// TODO: should be moved up to common place for Header and Main coponent to share

function createNewSample() {
  radio.trigger('samples:edit:attr', null, 'taxon', {
    onSuccess(taxon, editButtonClicked) {
      Factory.createSample('general', null, taxon)
        .then(sample => sample.save())
        .then(sample => {
          // add to main collection
          savedSamples.add(sample);

          // navigate
          if (editButtonClicked) {
            radio.trigger('samples:edit', sample.cid, { replace: true });
          } else {
            // return back to list page
            window.history.back();
          }
        });
    },
    showEditButton: true,
  });
}

/**
 * Need to push the main content down due to the subheader
 * @returns {string}
 */
function getBandMarginStyle(props) {
  if (!props.isActivity && !props.isTraining) {
    return {};
  }
  let amount = 0;

  if (props.isActivity) {
    amount++;
  }

  if (props.isTraining) {
    amount++;
  }

  return { '--padding-top': `${32 * amount}px` };
}

let lastScroll = 0;

@observer
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.infiniteScrollRef = React.createRef();
    this.contentRef = React.createRef();
    this.scroll = this.scroll.bind(this);
    this.state = { listShowLimit: 30 };
  }

  scroll(e) {
    this.setState({
      listShowLimit: this.state.listShowLimit + 30,
    });
    e.target.complete();

    if (this.state.listShowLimit >= this.props.savedSamples.length) {
      e.target.disabled = true;
    }
  }

  componentDidMount() {
    if (!this.infiniteScrollRef.current) {
      return;
    }
    this.infiniteScrollRef.current.addEventListener('ionInfinite', this.scroll);

    this.contentRef.current.scrollToPoint(lastScroll);
  }

  componentWillUnmount() {
    if (!this.infiniteScrollRef.current) {
      return;
    }
    this.contentRef.current.getScrollElement().then(el => {
      lastScroll = el.scrollTop;
    });
    this.infiniteScrollRef.current.removeEventListener(
      'ionInfinite',
      this.scroll
    );
  }

  render() {
    const training = this.props.isTraining;
    const filter = model =>
      !model.metadata.complex_survey && model.metadata.training === training;

    const samples = [...this.props.savedSamples]
      .sort(byDate)
      .slice(0, this.state.listShowLimit)
      .filter(filter);

    Log(`Samples:List:Controller: showing ${samples.length}.`);

    if (!samples.length) {
      return (
        <ion-content id="samples-list-container" style={getBandMarginStyle(this.props)}>
          <div id="empty-message">
            <div>
              <img src="images/empty-samples-list-icon.svg" />
            </div>
            <h6>{t('You have no records')}.</h6>

            <ion-button id="create-new-btn" onClick={createNewSample}>
              {t("Let's add one!")}
            </ion-button>
          </div>
        </ion-content>
      );
    }

    return (
      <ion-content
        ref={this.contentRef}
        id="samples-list-container"
        forceOverscroll={false}
        style={getBandMarginStyle(this.props)}>
        <UserFeedbackRequest
          samplesLength={samples.length}
          appModel={this.props.appModel}
        />

        <ion-list id="list">
          {samples.map(sample => (
            <Sample key={sample.cid} sample={sample} />
          ))}
        </ion-list>

        <ion-infinite-scroll threshold="300px" ref={this.infiniteScrollRef}>
          <ion-infinite-scroll-content />
        </ion-infinite-scroll>
      </ion-content>
    );
  }
}

Component.propTypes = {
  savedSamples: PropTypes.object.isRequired,
  isTraining: PropTypes.bool,
  appModel: PropTypes.object.isRequired,
};

export default Component;
