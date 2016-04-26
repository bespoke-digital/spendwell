
import Icon from 'components/icon';


export default class ArrowForwardIcon extends Icon {
  type = 'arrow-forward';

  renderInternal() {
    return (
      <g><path d='M12 4l-1.41 1.41 5.58 5.59h-12.17v2h12.17l-5.58 5.59 1.41 1.41 8-8z'></path></g>
    );
  }
}
