
import Icon from 'components/icon';


export default class TodayIcon extends Icon {
  type = 'today';

  renderInternal() {
    return (
      <g><path d='M19 3h-1v-2h-2v2h-8v-2h-2v2h-1c-1.11 0-1.99.9-1.99 2l-.01 14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2zm0 16h-14v-11h14v11zm-12-9h5v5h-5z'></path></g>
    );
  }
}
