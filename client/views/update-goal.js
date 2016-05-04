
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import { handleMutationError } from 'utils/network-layer';
import App from 'components/app';
import Button from 'components/button';
import Dialog from 'components/dialog';
import GoalForm from 'components/goal-form';

import { DeleteGoalMutation, UpdateGoalMutation } from 'mutations/goals';


class UpdateGoal extends Component {
  constructor() {
    super();
    this.state = { loading: false, confirmDelete: false };
  }

  deleteGoal() {
    const { viewer } = this.props;
    const { goal } = viewer;

    Relay.Store.commitUpdate(new DeleteGoalMutation({ viewer, goal }), {
      onFailure: ()=> {
        console.log('Failure: DeleteGoalMutation');
        this.setState({ confirmDelete: false });
      },
      onSuccess: ()=> {
        console.log('Success: DeleteGoalMutation');
        this.setState({ confirmDelete: false });
        browserHistory.push('/app/dashboard');
      },
    });
  }

  updateGoal({ name, monthlyAmount }) {
    const { viewer } = this.props;
    const { goal } = viewer;

    const args = { viewer, goal, name, monthlyAmount };

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new UpdateGoalMutation(args), {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: UpdateGoalMutation');
        this.setState({ loading: false });
        browserHistory.push('/app/dashboard');
      },
    });
  }

  render() {
    const { viewer } = this.props;
    const { loading, confirmDelete } = this.state;

    return (
      <App viewer={viewer} back={true} title={`Edit ${viewer.goal.name}`}>
        <div className='container'>
          {confirmDelete ?
            <Dialog size='sm'>
              <div className='body'>
                Are you sure? You can't take it back.
              </div>
              <div className='actions'>
                <Button onClick={()=> this.setState({ confirmDelete: false })}>Cancel</Button>
                <Button onClick={::this.deleteGoal} variant='danger'>Delete</Button>
              </div>
            </Dialog>
          : null}

          <GoalForm
            viewer={viewer}
            goal={viewer.goal}
            onSubmit={::this.updateGoal}
            onDelete={()=> this.setState({ confirmDelete: true })}
            onCancel={()=> browserHistory.goBack()}
            loading={loading}
          />
        </div>
      </App>
    );
  }
}

UpdateGoal = Relay.createContainer(UpdateGoal, {
  initialVariables: { id: null },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${DeleteGoalMutation.getFragment('viewer')}
        ${UpdateGoalMutation.getFragment('viewer')}

        goal(id: $id) {
          ${GoalForm.getFragment('goal')}
          ${DeleteGoalMutation.getFragment('goal')}
          ${UpdateGoalMutation.getFragment('goal')}

          name
        }
      }
    `,
  },
});

export default UpdateGoal;
