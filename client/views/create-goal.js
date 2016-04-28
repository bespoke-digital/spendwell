
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import { handleMutationError } from 'utils/network-layer';
import App from 'components/app';
import GoalForm from 'components/goal-form';
import PageHeading from 'components/page-heading';
import { CreateGoalMutation } from 'mutations/goals';

import styles from 'sass/views/create-bucket.scss';


class CreateGoal extends Component {
  constructor() {
    super();
    this.state = { loading: false };
  }

  handleSubmit({ name, monthlyAmount }) {
    const { viewer } = this.props;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new CreateGoalMutation({ viewer, name, monthlyAmount }), {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: CreateGoalMutation');
        this.setState({ loading: false });
        browserHistory.push('/app/dashboard');
      },
    });
  }

  render() {
    const { viewer } = this.props;
    const { loading } = this.state;

    return (
      <App viewer={viewer} back={true}>
        <div className={`container ${styles.root}`}>
          <PageHeading>
            <h1>Create a Goal</h1>
            <p>
              Goals are for saving. They come out of safe-to-spend at the
              beginning of the month so you're paying yourself first.
            </p>
          </PageHeading>

          <GoalForm
            onSubmit={::this.handleSubmit}
            onCancel={()=> browserHistory.goBack()}
            loading={loading}
            goal={null}
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
