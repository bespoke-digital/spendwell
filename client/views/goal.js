
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import App from 'components/app';
import GoalForm from 'components/goal-form';
// import { DeleteGoalMutation, UpdateGoalMutation } from 'mutations/goals';


class CreateGoal extends Component {
  constructor() {
    super();
    this.state = { showSettings: false };
  }

  updateGoal({ name, monthlyAmount }) {
    const { viewer } = this.props;

    monthlyAmount = parseInt(monthlyAmount * 100);

    // Relay.Store.commitUpdate(new UpdateGoalMutation({ viewer, name, monthlyAmount }), {
    //   onFailure: ()=> console.log('Failure: UpdateGoalMutation'),
    //   onSuccess: ()=> {
    //     console.log('Success: UpdateGoalMutation');
    //     browserHistory.push('/app/dashboard');
    //   },
    // });
  }

  deleteGoal() {
    const { viewer } = this.props;
    const { bucket } = viewer;

    // console.log('DeleteGoalMutation', { viewer, bucket });
    // Relay.Store.commitUpdate(new DeleteGoalMutation({ viewer, bucket }), {
    //   onFailure: ()=> console.log('Failure: DeleteGoalMutation'),
    //   onSuccess: ()=> {
    //     console.log('Success: DeleteGoalMutation');
    //     browserHistory.push('/app/dashboard');
    //   },
    // });
  }

  toggleSettings() {
    const { showSettings } = this.state;
    this.setState({ showSettings: !showSettings });
  }

  render() {
    const { viewer } = this.props;
    const { showSettings } = this.state;

    return (
      <App viewer={viewer} back={true}>
        <div className='container'>
          <div className='heading'>
            <h1>{viewer.goal.name}</h1>

            <Button onClick={::this.toggleSettings} flat>
              <i className='fa fa-cog'/>
            </Button>
            <Button onClick={::this.deleteGoal} flat variant='danger'>
              <i className='fa fa-times'/>
            </Button>
          </div>

          {showSettings ?
            <GoalForm
              goal={viewer.goal}
              onSubmit={::this.updateGoal}
              onCancel={()=> browserHistory.goBack()}
            />
          : null}
        </div>
      </App>
    );
  }
}

CreateGoal = Relay.createContainer(CreateGoal, {
  initialVariables: { id: null },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}

        goal(id: $id) {
          ${GoalForm.getFragment('goal')}

          name
        }
      }
    `,
  },
});
          // ${DeleteGoalMutation.getFragment('goal')}
          // ${UpdateGoalMutation.getFragment('goal')}

export default CreateGoal;
