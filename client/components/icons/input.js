
import Icon from 'components/icon';


export default class InputIcon extends Icon {
  type = 'input';

  renderInternal() {
    return (
      <g><path d='M21 3.01h-18c-1.1 0-2 .9-2 2v3.99h2v-4.01h18v14.03h-18v-4.02h-2v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2zm-10 12.99l4-4-4-4v3h-10v2h10v3z'></path></g>
    );
  }
}
