
import Icon from 'components/icon';


export default class WarningIcon extends Icon {
  type = 'warning';

  renderInternal() {
    return (
      <g><path d='M1 21h22l-11-19-11 19zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'></path></g>
    );
  }
}
