/* eslint-disable jsx-a11y/label-has-associated-control */
import { ReactNode } from 'react';
import clsx from 'clsx';
import FilterSelect from './FilterSelect';
import './styles.css';

let today = new Date();
const threeDaysAgo = new Date(today.setDate(today.getDate() - 3)).toISOString();

today = new Date();
export const monthAgo = new Date(
  today.setMonth(today.getMonth() - 1)
).toISOString();

today = new Date();
const sixMonthsAgo = new Date(
  today.setMonth(today.getMonth() - 6)
).toISOString();

today = new Date();
const yearAgo = new Date(today.setMonth(today.getMonth() - 12)).toISOString();

export const dateRanges = [
  { label: 'Last three days', value: threeDaysAgo },
  { label: 'Last month', value: monthAgo },
  { label: 'Last six months', value: sixMonthsAgo },
  { label: 'Last year', value: yearAgo },
];

type Props = {
  onChange: any;
  value: boolean;
  label: string;
  icon: ReactNode;
};

const CheckmarkIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="42"
      d="M416 128L192 384l-96-96"
    />
  </svg>
);

const Filter = ({
  value,
  onChange: onChangeProp,
  label,
  icon: iconProp,
}: Props) => {
  const onChange = (e: any) => onChangeProp(e.target.checked);

  const icon = value ? CheckmarkIcon : <img src={iconProp as string} />;

  return (
    <div className="toggle-badge">
      <label>
        <input type="checkbox" checked={value} onChange={onChange} />
        <div>
          {icon}
          <span>{label}</span>
        </div>
      </label>
    </div>
  );
};

interface MapFiltersProps {
  children: ReactNode;
  className?: string;
}

const MapFilters = ({ children, className }: MapFiltersProps) => {
  return <div className={clsx('map-filters', className)}>{children}</div>;
};

MapFilters.Filter = Filter;
MapFilters.Select = FilterSelect;

export default MapFilters;
