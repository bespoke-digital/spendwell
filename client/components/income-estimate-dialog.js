
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import { handleMutationError } from 'utils/network-layer';
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
    const { viewer, onRequestClose } = this.props;
    const amount = _.isUndefined(this.state.amount) ? viewer.estimatedIncome : this.state.amount;

    this.setState({ loading: true });

    Relay.Store.commitUpdate(new SetIncomeEstimateMutation({ viewer, amount }), {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('SetIncomeEstimateMutation Success');
        this.setState({ loading: false });
        onRequestClose();
      },
    });
  }

  render() {
    const { viewer, onRequestClose } = this.props;
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
            initialValue={viewer.estimatedIncome}
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

        estimatedIncome
      }
    `,
  },
});

export default IncomeEstimateDialog;
