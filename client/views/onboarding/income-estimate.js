
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import Onboarding from 'components/onboarding';
import Card from 'components/card';
import CardList from 'components/card-list';
import MoneyInput from 'components/money-input';
import GraphicCard from 'components/graphic-card';
import Icon from 'components/icon';
import Transition from 'components/transition';

import { SetIncomeEstimateMutation } from 'mutations/users';

import incomeImage from 'img/views/onboarding/income.svg';
import styles from 'sass/views/accounts';


class OnboardingIncomeEstimate extends Component {
  constructor() {
    super();
    this.state = { loading: false, help: true };
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
    const { help } = this.state;

    return (
      <Onboarding viewer={viewer}>

        <Transition show={help}>
          <GraphicCard
            scheme='green'
            image={incomeImage}
            header={'We\'ve Estimated Your Income'}
            paragraph={`
              Take a quick look and fix it if we got it wrong. We use it to
              figure out your safe to spend number before
              you get paid for the month.
            `}
            next={
              <Button fab onClick={()=> this.setState({ help: false })}>
                <Icon type='check'/>
              </Button>
            }
            onRequestClose={()=> this.setState({ help: false })}
          />
        </Transition>

        <div className={`container skinny ${styles.root}`}>
          <div className='heading'>
            <h1>Income Estimate</h1>
          </div>

          <CardList>
            <Card>
              <MoneyInput
                label='Income'
                initialValue={viewer.estimatedIncome}
                onChange={(amount)=> this.setState({ amount })}
              />
            </Card>
          </CardList>

          <div className='flex-row'>
            <div/>
            <Button variant='primary' onClick={::this.handleSubmit}>
              Finish
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
