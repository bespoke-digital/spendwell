
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';

import GoalForm from 'components/goal-form';
import Card from 'components/card';
import CardList from 'components/card-list';
import TextActions from 'components/text-actions';
import A from 'components/a';
import BottomSheet from 'components/bottom-sheet';
import Icon from 'components/icon';
import Spinner from 'components/spinner';

import { handleMutationError } from 'utils/network-layer';
import { CreateGoalMutation } from 'mutations/goals';
import { SettingsMutation } from 'mutations/users';

import styles from 'sass/components/create-bucket-sheet';


class CreateGoalSheet extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
  };

  state = {
    loading: false,
    name: '',
    monthlyAmount: 0,
  };

  isValid() {
    const { loading, name, monthlyAmount } = this.state;
    return !loading && monthlyAmount !== 0 & name.length > 0;
  }

  handleSubmit() {
    const { viewer, onRequestClose, relay } = this.props;
    const { name, monthlyAmount } = this.state;

    if (!this.isValid())
      return;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new CreateGoalMutation({ viewer, name, monthlyAmount }), {
      onFailure: (response)=> {
        this.setState({ loading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: CreateGoalMutation');
        this.setState({ loading: false, name: '', monthlyAmount: 0 });
        relay.forceFetch();
        onRequestClose();
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
    const { viewer, type, visible, onRequestClose } = this.props;
    const { loading } = this.state;

    return (
      <BottomSheet
        className={`${styles.root} ${type}`}
        visible={visible}
        onRequestClose={onRequestClose}
        title='New Goal'
        actions={loading ?
          <div className='spinner-container'><Spinner/></div>
        :
          <A className='action' onClick={::this.handleSubmit}>
            <Icon
              type='send'
              color={this.isValid() ? 'light' : 'dark'}
            />
          </A>
        }
      >
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
          onChange={({ name, monthlyAmount })=> this.setState({ name, monthlyAmount })}
          goal={null}
        />
      </BottomSheet>
    );
  }
}

CreateGoalSheet = Relay.createContainer(CreateGoalSheet, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${CreateGoalMutation.getFragment('viewer')}
        ${SettingsMutation.getFragment('viewer')}

        settings {
          createGoalHelp
        }
      }
    `,
  },
});

export default CreateGoalSheet;
