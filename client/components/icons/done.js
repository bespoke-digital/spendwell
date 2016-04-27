
import Icon from 'components/icon';


export default class DoneIcon extends Icon {
  type = 'done';

  renderInternal() {
    return (
      <g><path d='M9 16.17l-4.17-4.17-1.42 1.41 5.59 5.59 12-12-1.41-1.41z'></path></g>
    );
  }
}
