
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import Onboarding from 'components/onboarding';
import Card from 'components/card';
import CardList from 'components/card-list';
import MoneyInput from 'components/money-input';

import { SetIncomeEstimateMutation } from 'mutations/users';

import styles from 'sass/views/accounts';


class OnboardingIncomeEstimate extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  handleSubmit() {
    const { viewer } = this.props;
    const amount = _.isUndefined(this.state.amount) ? viewer.estimatedIncome : this.state.amount;

    this.setState({ loading: true });

    Relay.Store.commitUpdate(new SetIncomeEstimateMutation({ viewer, amount }), {
      onFailure: ()=> {
        console.log('Failure: SetIncomeEstimateMutation');
        this.setState({ loading: false });
      },
      onSuccess: ()=> {
        console.log('Success: SetIncomeEstimateMutation');
        this.setState({ loading: false });
        browserHistory.push('/app/dashboard');
      },
    });
  }

  render() {
    const { viewer } = this.props;

    return (
      <Onboarding viewer={viewer}>
        <div className={`container skinny ${styles.root}`}>
          <div className='heading'>
            <h1>Income Estimate</h1>
          </div>

          <CardList>
            <Card>
              This is our guess at your monthly income. We use it to calculate
              a lot of other numbers, so please make sure it's correct.
            </Card>
            <Card>
              <MoneyInput
                label='Income'
                initialValue={viewer.estimatedIncome}
                onChange={(income)=> this.setState({ income })}
              />
            </Card>
          </CardList>

          <div className='flex-row'>
            <div/>
            <Button variant='primary' onClick={::this.handleSubmit}>
              Continue
            </Button>
          </div>
        </div>
      </Onboarding>
    );
  }
}

OnboardingIncomeEstimate = Relay.createContainer(OnboardingIncomeEstimate, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${Onboarding.getFragment('viewer')}
        ${SetIncomeEstimateMutation.getFragment('viewer')}

        estimatedIncome
      }
    `,
  },
});

export default OnboardingIncomeEstimate;
