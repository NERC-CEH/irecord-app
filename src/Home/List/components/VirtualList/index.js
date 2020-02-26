import React from 'react';
import PropTypes from 'prop-types';
import VirtualList from 'react-tiny-virtual-list';
import { IonItemDivider, IonLabel } from '@ionic/react';
import DateHelp from 'helpers/date';
import Survey from './components/Survey';

function roundDate(date) {
  let roundedDate = date - (date % (24 * 60 * 60 * 1000)); // subtract amount of time since midnight
  roundedDate += new Date().getTimezoneOffset() * 60 * 1000; // add on the timezone offset
  return new Date(roundedDate);
}

function Component({ surveys, listHeight }) {
  const dates = [];
  const dateIndices = [];

  const groupedSurveys = [];
  let counter = null;

  [...surveys].forEach(survey => {
    const date = roundDate(new Date(survey.attrs.date)).toString();
    if (!dates.includes(date)) {
      dates.push(date);
      dateIndices.push(groupedSurveys.length);
      counter = { date, count: 0 };
      groupedSurveys.push(counter);
    }

    counter.count++;
    groupedSurveys.push(survey);
  });

  // eslint-disable-next-line
  const renderItem = ({ index, style }) => {
    if (dateIndices.includes(index)) {
      const { date, count } = groupedSurveys[index];
      return (
        <IonItemDivider key={date} style={style}>
          <IonLabel>{DateHelp.print(date, true)}</IonLabel>
          {count > 1 && <IonLabel slot="end">{count}</IonLabel>}
        </IonItemDivider>
      );
    }

    return (
      <Survey
        key={groupedSurveys[index].cid}
        sample={groupedSurveys[index]}
        style={style}
      />
    );
  };

  return (
    <VirtualList
      width="100%"
      stickyIndices={dateIndices}
      height={listHeight}
      itemCount={groupedSurveys.length}
      itemSize={index => {
        if (dateIndices.includes(index)) {
          return 30;
        }
        return 73;
      }}
      renderItem={renderItem}
    />
  );
}

Component.propTypes = {
  surveys: PropTypes.array.isRequired,
  listHeight: PropTypes.number.isRequired,
};

export default Component;
