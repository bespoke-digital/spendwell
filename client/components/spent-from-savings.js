
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import SuperCard from 'components/super-card';
import Card from 'components/card';
import Money from 'components/money';
import TransactionList from 'components/transaction-list';


class SpentFromSavings extends Component {
  static propTypes = {
    month: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    selected: PropTypes.bool,
  };

  static defaultProps = {
    selected: false,
  };

  render() {
    const { summary, onClick, selected } = this.props;

    return (
      <SuperCard expanded={selected} summary={
        <Card expanded={selected} onSummaryClick={onClick} summary={
          <div>
            <div>Spent From Savings</div>
            <div className='amount'>
              <Money amount={summary.spentFromSavings} abs={true}/>
            </div>
          </div>
        }>
        </Card>
      }>
        <TransactionList transactions={summary.transactions} monthHeaders={false}/>
      </SuperCard>
    );
  }
}

SpentFromSavings = Relay.createContainer(SpentFromSavings, {
  fragments: {
    summary: ()=> Relay.QL`
      fragment on Summary {
        spentFromSavings
        transactions(first: 1000, fromSavings: true) {
          ${TransactionList.getFragment('transactions')}
        }
      }
    `,
  },
});

export default SpentFromSavings;
