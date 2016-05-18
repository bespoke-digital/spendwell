
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';

import GoalForm from 'components/goal-form';
import Card from 'components/card';
import CardList from 'components/card-list';
import TextActions from 'components/text-actions';
import A from 'components/a';
import BottomSheet from 'components/bottom-sheet';
import Spinner from 'components/spinner';
import Button from 'components/button';

import track from 'utils/track';
import { handleMutationError } from 'utils/network-layer';
import { CreateGoalMutation } from 'mutations/goals';
import { SettingsMutation } from 'mutations/users';

import styles from 'sass/components/create-bucket-sheet';


class CreateGoalSheet extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    onComplete: PropTypes.func,
    visible: PropTypes.bool.isRequired,
  };

  state = {
    loading: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible)
      this.props.relay.setVariables({ open: nextProps.visible });
  }

  handleSubmit() {
    const { viewer, onRequestClose, onComplete } = this.props;
    const { loading } = this.state;
    const goalForm = this.refs.goalForm.refs.component;

    if (!goalForm.isValid() || loading)
      return;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new CreateGoalMutation({ viewer, ...goalForm.getData() }), {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: CreateGoalMutation');

        this.setState({ loading: false });
        goalForm.reset();

        if (onComplete)
          onComplete();

        onRequestClose();

        track('create-goal');
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
    const { viewer, type, relay, onRequestClose } = this.props;
    const { open } = relay.variables;
    const { loading } = this.state;

    return (
      <BottomSheet
        className={`${styles.root} ${type}`}
        visible={open}
        onRequestClose={onRequestClose}
        title='New Goal'
        actions={loading ?
          <div className='spinner-container'><Spinner/></div>
        :
          <Button className='action' onClick={::this.handleSubmit} plain color='light'>
            Save
          </Button>
        }
      >
        {open && viewer.settings.createGoalHelp ?
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

        {open ?
          <GoalForm ref='goalForm' goal={null}/>
        : null}
      </BottomSheet>
    );
  }
}

CreateGoalSheet = Relay.createContainer(CreateGoalSheet, {
  initialVariables: {
    open: false,
  },
  fragments: {
    viewer: (variables)=> Relay.QL`
      fragment on Viewer {
        ${CreateGoalMutation.getFragment('viewer').if(variables.open)}
        ${SettingsMutation.getFragment('viewer').if(variables.open)}

        settings @include(if: $open) {
          createGoalHelp
        }
      }
    `,
  },
});

export default CreateGoalSheet;
