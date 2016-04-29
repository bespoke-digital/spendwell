
import Icon from 'components/icon';


export default class CreditCardIcon extends Icon {
  type = 'credit-card';

  renderInternal() {
    return (
      <g><path d='M4 12h16v6h-16z'></path><path d='M20 4h-16c-1.11 0-1.99.89-1.99 2l-.01 12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2v-12c0-1.11-.89-2-2-2zm0 14h-16v-6h16v6zm0-10h-16v-2h16v2z'></path></g>
    );
  }
}
