
import Icon from 'components/icon';


export default class AccountBalanceWalletIcon extends Icon {
  type = 'account-balance-wallet';

  renderInternal() {
    return (
      <g><path d='M21 18v1c0 1.1-.9 2-2 2h-14c-1.11 0-2-.9-2-2v-14c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10v-8h-10v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'></path></g>
    );
  }
}
