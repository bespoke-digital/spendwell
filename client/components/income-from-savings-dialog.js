
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import MoneyInput from 'components/money-input';
import Dialog from 'components/dialog';

import { SetIncomeFromSavingsMutation } from 'mutations/transactions';


class IncomeFromSavingsDialog extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { loading: false };
  }

  handleAddFromSavingsSubmit() {
    const { viewer, summary, onRequestClose } = this.props;
    const { amount } = this.state;

    this.setState({ loading: true });

    Relay.Store.commitUpdate(new SetIncomeFromSavingsMutation({
      month: summary.monthStart,
      viewer,
      amount: !_.isUndefined(amount) ? amount : summary.fromSavingsIncome,
    }), {
      onFailure: ()=> {
        console.log('AssignTransactionsMutation Failure');
        this.setState({ loading: false });
      },
      onSuccess: ()=> {
        console.log('AssignTransactionsMutation Success');
        this.setState({ loading: false });
        onRequestClose();
      },
    });
  }

  render() {
    const { summary, onRequestClose } = this.props;
    const { loading } = this.state;

    return (
      <Dialog size='sm' onRequestClose={onRequestClose}>
        <div className='body'>
          <h3>Add money to this month's in</h3>
          <p>
            Only use this if you have money in your account from a previous
            month that you are spending this month.
          </p>
          <MoneyInput
            label='Amount'
            initialValue={summary.fromSavingsIncome}
            onChange={(amount)=> this.setState({ amount })}
            autoFocus
            select
          />
        </div>
        <div className='actions'>
          <Button onClick={onRequestClose}>Cancel</Button>
          <Button
            onClick={::this.handleAddFromSavingsSubmit}
            variant='primary'
            loading={loading}
          >Add</Button>
        </div>
      </Dialog>
    );
  }
}

IncomeFromSavingsDialog = Relay.createContainer(IncomeFromSavingsDialog, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${SetIncomeFromSavingsMutation.getFragment('viewer')}
      }
    `,
    summary: ()=> Relay.QL`
      fragment on Summary {
        fromSavingsIncome
        monthStart
      }
    `,
  },
});

export default IncomeFromSavingsDialog;
