
import { Component } from 'react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import App from 'components/app';
import GoalForm from 'components/goal-form';
import Card from 'components/card';
import CardList from 'components/card-list';
import TextActions from 'components/text-actions';
import A from 'components/a';

import { handleMutationError } from 'utils/network-layer';
import { CreateGoalMutation } from 'mutations/goals';
import { SettingsMutation } from 'mutations/users';

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

  dismissHelp() {
    const { viewer } = this.props;

    Relay.Store.commitUpdate(new SettingsMutation({
      viewer,
      createGoalHelp: false,
    }), { onFailure: handleMutationError });
  }

  render() {
    const { viewer } = this.props;
    const { loading } = this.state;

    return (
      <App viewer={viewer} back={true} title='Create a Goal' className={styles.root}>
        {viewer.settings.createGoalHelp ?
          <CardList>
            <Card>
              Goals are for saving. They come out of safe-to-spend at the
              beginning of the month so you're paying yourself first.
              <TextActions>
                <A onClick={::this.dismissHelp}>Dismiss</A>
              </TextActions>
            </Card>
          </CardList>
        : null}

        <GoalForm
          onSubmit={::this.handleSubmit}
          onCancel={()=> browserHistory.goBack()}
          loading={loading}
          goal={null}
        />
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
        ${SettingsMutation.getFragment('viewer')}

        settings {
          createGoalHelp
        }
      }
    `,
  },
});

export default CreateGoal;
