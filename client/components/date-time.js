
import moment from 'moment';

export default function DateTime({ value, format }) {
  if (!moment.isMoment(value))
    value = moment(value);

  if (!format)
    format = 'MMMM Do, YYYY';

  value = value.asUtc().format(format);

  return <span className='datetime'>{value}</span>;
}
