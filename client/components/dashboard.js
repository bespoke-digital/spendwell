
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { fetch, selectAccount } from 'state/institutions';
import styles from 'sass/components/home.scss';


class Dashboard extends Component {
  componentDidMount() {
    this.props.dispatch(fetch());
  }

  onAccountSelect(event, account) {
    this.props.dispatch(selectAccount({ account }));
  }

  render() {
    const { accounts, transactions, selectedAccount } = this.props.institutions;

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

Dashboard.contextTypes = {
  history: PropTypes.object.isRequired,
};

Dashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  institutions: PropTypes.object.isRequired,
};

export default connect((state)=> ({
  auth: state.auth,
  institutions: state.institutions,
}))(Dashboard);
