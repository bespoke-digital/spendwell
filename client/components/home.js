
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { fetch, selectAccount } from 'state/bank';
import styles from 'sass/components/home.scss';


class Home extends Component {
  componentDidMount() {
    this.props.dispatch(fetch());
  }

  onAccountSelect(event, account) {
    console.log(account);
    this.props.dispatch(selectAccount({ account }));
  }

  render() {
    if (!this.props.auth.authenticated || !this.props.auth.user.isConnected) {
      return (
        <div className={`container ${styles.root}`}>
          <h1>Home</h1>
          {this.props.auth.authenticated ? (
            <span>Please <Link to='/connect'>connect</Link> your account.</span>
          ) : (
            <span>Please <Link to='/login'>login</Link>.</span>
          )}
        </div>
      );
    }

    const { accounts, transactions, selectedAccount } = this.props.bank;
    console.log(this.props.bank);

    return (
      <div className={`container ${styles.root}`}>
        <DropdownButton title='Accounts' id='accounts' onSelect={::this.onAccountSelect}>
          <MenuItem active={!selectedAccount}>All</MenuItem>
          {accounts.map((account, index)=> (
            <MenuItem key={index} eventKey={account} active={selectedAccount === account}>
              {`${account.meta.name} (${account.meta.number})`}
            </MenuItem>
          ))}
        </DropdownButton>

        <h3>
          Transactions{' '}
          {selectedAccount ? (<small>{selectedAccount.meta.name}</small>) : null}
        </h3>
        <table className='table'>
          <tbody>
            {transactions.map((transaction, index)=> (
              <tr key={index}>
                <td>
                  {transaction.name}
                  {transaction.category && transaction.category.map((category, i)=> (
                    <span key={i} className='label label-primary'>{category}</span>
                  ))}
                </td>
                <td>{transaction.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

Home.propTypes = {
  auth: PropTypes.object.isRequired,
  bank: PropTypes.object.isRequired,
};

export default connect((state)=> ({
  auth: state.auth,
  bank: state.bank,
}))(Home);
