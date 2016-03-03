
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import App from 'components/app';
import GoalForm from 'components/goal-form';
import { CreateGoalMutation } from 'mutations/goals';

import styles from 'sass/views/create-bucket.scss';


class CreateGoal extends Component {
  constructor() {
    super();
    this.state = { valid: false };
  }

  handleSubmit({ name, monthlyAmount }) {
    const { viewer } = this.props;

    monthlyAmount = parseInt(parseFloat(monthlyAmount) * 100);

    Relay.Store.commitUpdate(new CreateGoalMutation({ viewer, name, monthlyAmount }), {
      onFailure: ()=> console.log('Failure: CreateGoalMutation'),
      onSuccess: ()=> {
        console.log('Success: CreateGoalMutation');
        browserHistory.push('/app/dashboard');
      },
    });
  }

  render() {
    const { viewer } = this.props;

    return (
      <App viewer={viewer} back={true}>
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <h1>New Goal</h1>
          </div>

          <GoalForm
            onSubmit={::this.handleSubmit}
            onCancel={()=> browserHistory.goBack()}
          />
        </div>
      </App>
    );
  }
}

CreateGoal = Relay.createContainer(CreateGoal, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${CreateGoalMutation.getFragment('viewer')}
      }
    `,
  },
});

export default CreateGoal;
