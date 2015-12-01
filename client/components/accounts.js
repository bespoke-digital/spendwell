
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getList } from 'state/accounts';
import styles from 'sass/components/accounts.scss';


const Transactions = (props)=> (
  <table className='table'>
    <thead>
      <tr>
        <th>Name</th>
        <th>Amount</th>
        <th>Category</th>
      </tr>
    </thead>
    <tbody>
      {props.transactions.map((transaction)=> (
        <tr key={transaction.id}>
          <td>{transaction.name}</td>
          <td>{transaction.amount}</td>
          <td>{transaction.category ? transaction.category.name : ''}</td>
        </tr>
      ))}
    </tbody>
  </table>
);


class Accounts extends Component {
  static propTypes = {
    accounts: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { selectedAccount: null };
  }

  componentDidMount() {
    this.props.dispatch(getList());
  }

  render() {
    const { selectedAccount } = this.state;
    return (
      <div className={`container ${styles.root}`}>
        <div className='row'>
          <div className='col-sm-3'>
            <ul className='nav nav-pills nav-stacked'>
              {this.props.accounts.map((account)=> (
                <li key={account.id}>
                  <a
                    href='#'
                    className={selectedAccount === account ? 'active' : ''}
                    onClick={this.setState.bind(this, { selectedAccount: account }, null)}
                  >
                    {`${account.name} (${account.balance_current})`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className='col-sm-9'>
            {selectedAccount ? [
              <h1 key='title'>{selectedAccount.name}</h1>,
              <Transactions key='trans' transactions={selectedAccount.transactions}/>,
            ] : (
              <h1>Select an account</h1>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state)=> ({
  accounts: state.accounts.list,
}))(Accounts);
