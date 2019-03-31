import React from 'react';
import PropTypes from 'prop-types';
import radio from 'radio';
import Log from 'helpers/log';
import StringHelp from 'helpers/string';
import Toggle from 'common/Components/Toggle';

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.onToggle = this.onToggle.bind(this);
  }

  onToggle(attr, checked) {
    const { sample } = this.props;

    const occ = sample.getOccurrence();

    const attrParts = attr.split(':');
    const attrType = attrParts[0];
    const attrName = attrParts[1];

    const model = attrType === 'smp' ? sample : occ;

    model.set(attrName, checked);

    // save it
    return sample.save().catch(err => {
      Log(err, 'e');
      radio.trigger('app:dialog:error', err);
    });
  }

  render() {
    const { activityExists, sample, appModel } = this.props;

    const occ = sample.getOccurrence();
    const locks = {
      number: appModel.isAttrLocked(occ, 'number'),
    };

    const isSynchronising = sample.remote.synchronising;

    const survey = sample.getSurvey();

    // generate template
    const attributes = [];
    survey.editForm.forEach(element => {
      const attrParts = element.split(':');
      const attrType = attrParts[0];
      const attrName = attrParts[1];

      const model = attrType === 'smp' ? sample : occ;

      locks[element] = appModel.isAttrLocked(model, attrName);

      let currentVal;
      switch (element) {
        case 'occ:number':
          currentVal = StringHelp.limit(occ.get('number'));
          if (!currentVal) {
            currentVal = StringHelp.limit(occ.get('number-ranges'));
          }
          break;
        default:
          currentVal = StringHelp.limit(model.get(attrName));
      }

      const attr = survey.attrs[attrType][attrName];
      const label =
        attr.label || attrName.slice(0, 1).toUpperCase() + attrName.slice(1);
      const icon = attr.icon || 'dot';

      if (attr.type === 'toggle') {
        attributes.push(
          <ion-item key={element}>
            <ion-label>{t(label)}</ion-label>
            <Toggle
              onToggle={checked => this.onToggle(element, checked)}
              checked={!!currentVal}
            />
            <span
              slot="start"
              className={`media-object icon icon-${icon} toggle-icon`}
            />
          </ion-item>
        );
        return;
      }

      attributes.push(
        <ion-item
          key={element}
          href={`#samples/${sample.cid}/edit/${element}`}
          id={`${element}-button`}
          detail
          detail-icon={locks[element] ? 'lock' : 'ios-arrow-forward'}
        >
          <span slot="start" className={`media-object icon icon-${icon}`} />
          <span slot="end" className="media-object pull-right descript">
            {t(currentVal)}
          </span>
          {t(label)}
        </ion-item>
      );
    });

    return (
      <ion-list
        lines="full"
        id="attrs"
        class={`table-view inputs no-top ${
          activityExists ? 'withActivity' : ''
        } ${isSynchronising ? 'disabled' : ''}`}
      >
        {attributes}
      </ion-list>
    );
  }
}

Component.propTypes = {
  activityExists: PropTypes.bool.isRequired,
  sample: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
};

export default Component;
