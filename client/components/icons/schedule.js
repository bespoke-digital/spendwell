
import Icon from 'components/icon';


export default class ScheduleIcon extends Icon {
  type = 'schedule';

  renderInternal() {
    return (
      <g><path fill-opacity='.9' d='M11.99 2c-5.52 0-9.99 4.48-9.99 10s4.47 10 9.99 10c5.53 0 10.01-4.48 10.01-10s-4.48-10-10.01-10zm.01 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'></path><path fill-opacity='.9' d='M12.5 7h-1.5v6l5.25 3.15.75-1.23-4.5-2.67z'></path></g>
    );
  }
}
