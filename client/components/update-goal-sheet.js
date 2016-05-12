
import Relay from 'react-relay';
import { Component, PropTypes } from 'react';

import GoalForm from 'components/goal-form';
import BottomSheet from 'components/bottom-sheet';
import Button from 'components/button';
import Dialog from 'components/dialog';

import { handleMutationError } from 'utils/network-layer';
import { DeleteGoalMutation, UpdateGoalMutation } from 'mutations/goals';

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

  handleDelete() {
    const { viewer, goal, onDeleted, onRequestClose } = this.props;

    Relay.Store.commitUpdate(new DeleteGoalMutation({ viewer, goal }), {
      onFailure: ()=> {
        console.log('Failure: DeleteGoalMutation');
        this.setState({ deleteLoading: false, confirmDelete: false });
      },
      onSuccess: ()=> {
        console.log('Success: DeleteGoalMutation');
        this.setState({ deleteLoading: false, confirmDelete: false });

        if (onDeleted)
          onDeleted();

        onRequestClose();
      },
    });
  }

  handleUpdate() {
    const { viewer, goal, onUpdated, onRequestClose } = this.props;
    const { updateLoading } = this.state;
    const goalForm = this.refs.goalForm.refs.component;

    if (!goalForm.isValid() || updateLoading)
      return;

    const args = { viewer, goal, ...goalForm.getData() };

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new UpdateGoalMutation(args), {
      onFailure: (response)=> {
        this.setState({ updateLoading: false });
        handleMutationError(response);
      },
      onSuccess: ()=> {
        console.log('Success: UpdateGoalMutation');
        this.setState({ updateLoading: false });

        if (onUpdated)
          onUpdated();

        onRequestClose();
      },
    });
  }

  render() {
    const { goal, type, relay, onRequestClose } = this.props;
    const { open } = relay.variables;
    const { updateLoading, deleteLoading, confirmDelete } = this.state;

    return (
      <BottomSheet
        className={`${styles.root} ${type}`}
        visible={open}
        onRequestClose={onRequestClose}
        title={`Edit ${goal.name}`}
        actions={<span>
          <Button
            className='action'
            onClick={()=> this.setState({ confirmDelete: true })}
            plain
            color='light'
            loading={deleteLoading}
          >Delete</Button>
          <Button
            className='action'
            onClick={::this.handleUpdate}
            plain
            color='light'
            loading={updateLoading}
          >Save</Button>
        </span>}
      >
        {confirmDelete ?
          <Dialog size='sm' onRequestClose={()=> this.setState({ confirmDelete: false })}>
            <div className='body'>
              Are you sure you'd like to perminantly delete {goal.name}?
            </div>
            <div className='actions'>
              <Button onClick={()=> this.setState({ confirmDelete: false })} flat>Cancel</Button>
              <Button
                onClick={::this.handleDelete}
                loading={deleteLoading}
                variant='danger'
                flat
              >Delete</Button>
            </div>
          </Dialog>
        : null}

        {open ?
          <GoalForm ref='goalForm' goal={goal}/>
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
        ${UpdateGoalMutation.getFragment('viewer').if(variables.open)}
        ${DeleteGoalMutation.getFragment('viewer').if(variables.open)}
      }
    `,
    goal: (variables)=> Relay.QL`
      fragment on GoalNode {
        ${GoalForm.getFragment('goal').if(variables.open)}
        ${DeleteGoalMutation.getFragment('goal').if(variables.open)}
        ${UpdateGoalMutation.getFragment('goal').if(variables.open)}

        name
      }
    `,
  },
});

export default CreateGoalSheet;
