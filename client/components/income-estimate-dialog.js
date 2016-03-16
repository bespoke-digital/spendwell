
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import MoneyInput from 'components/money-input';
import Dialog from 'components/dialog';

import { SetIncomeEstimateMutation } from 'mutations/users';


class IncomeEstimateDialog extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { loading: false };
  }

  handleSubmit() {
    const { viewer, summary, onRequestClose } = this.props;
    const amount = _.isUndefined(this.state.amount) ? summary.estimatedIncome : this.state.amount;

    this.setState({ loading: true });

    Relay.Store.commitUpdate(new SetIncomeEstimateMutation({ viewer, amount }), {
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
          <h3>Adjust your income estimate</h3>
          <p>
            We use this number at the beginning of the month before you've
            been completely paid.
          </p>
          <MoneyInput
            label='Amount'
            initialValue={summary.estimatedIncome}
            onChange={(amount)=> this.setState({ amount })}
          />
        </div>
        <div className='actions'>
          <Button onClick={onRequestClose}>Cancel</Button>
          <Button
            onClick={::this.handleSubmit}
            variant='primary'
            loading={loading}
          >Add</Button>
        </div>
      </Dialog>
    );
  }
}

IncomeEstimateDialog = Relay.createContainer(IncomeEstimateDialog, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${SetIncomeEstimateMutation.getFragment('viewer')}
      }
    `,
    summary: ()=> Relay.QL`
      fragment on Summary {
        estimatedIncome
      }
    `,
  },
});

export default IncomeEstimateDialog;
