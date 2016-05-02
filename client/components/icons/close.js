
import Icon from 'components/icon';


export default class CloseIcon extends Icon {
  type = 'close';

  renderInternal() {
    return (
      <g><path d='M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z'></path></g>
    );
  }
}
