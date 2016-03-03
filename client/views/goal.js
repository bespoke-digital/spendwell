
import { Component } from 'react';
import { browserHistory } from 'react-router';
import Relay from 'react-relay';
import moment from 'moment';

import Button from 'components/button';
import App from 'components/app';
import GoalForm from 'components/goal-form';
import Card from 'components/card';
import CardList from 'components/card-list';
import { DeleteGoalMutation, UpdateGoalMutation } from 'mutations/goals';


class CreateGoal extends Component {
  constructor() {
    super();
    this.state = { showSettings: false };
  }

  updateGoal({ name, monthlyAmount }) {
    const { viewer } = this.props;
    const { goal } = viewer;

    Relay.Store.commitUpdate(new UpdateGoalMutation({
      viewer,
      goal,
      name,
      monthlyAmount,
    }), {
      onFailure: ()=> console.log('Failure: UpdateGoalMutation'),
      onSuccess: ()=> {
        console.log('Success: UpdateGoalMutation');
        this.setState({ showSettings: false });
      },
    });
  }

  deleteGoal() {
    const { viewer } = this.props;
    const { goal } = viewer;

    console.log('DeleteGoalMutation', { viewer, goal });
    Relay.Store.commitUpdate(new DeleteGoalMutation({ viewer, goal }), {
      onFailure: ()=> console.log('Failure: DeleteGoalMutation'),
      onSuccess: ()=> {
        console.log('Success: DeleteGoalMutation');
        browserHistory.push('/app/dashboard');
      },
    });
  }

  generateMonth() {
    const { viewer } = this.props;
    const { goal } = viewer;

    // console.log('GenerateGoalMonthMutation', { viewer, goal });
    // Relay.Store.commitUpdate(new GenerateGoalMonthMutation({ viewer, goal }), {
    //   onFailure: ()=> console.log('Failure: GenerateGoalMonthMutation'),
    //   onSuccess: ()=> {
    //     console.log('Success: GenerateGoalMonthMutation');
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
            <CardList>
              <GoalForm
                goal={viewer.goal}
                onSubmit={::this.updateGoal}
                onCancel={::this.toggleSettings}
              />
            </CardList>
          : null}

          {viewer.goal.months.edges.map(({ node })=>
            <Card key={node.id}>
              <div><strong>{moment(node.monthStart).asUtc().format('MMMM YYYY')}</strong></div>
              <div><strong>{'target: '}</strong>{node.targetAmount}</div>
              <div><strong>{'filled: '}</strong>{node.filledAmount}</div>
            </Card>
          )}

          <div className='bottom-load-button'>
            <Button onClick={::this.generateMonth} flat>
              <i className='fa fa-plus'/>{' Add Month'}
            </Button>
          </div>
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
        ${DeleteGoalMutation.getFragment('viewer')}
        ${UpdateGoalMutation.getFragment('viewer')}

        goal(id: $id) {
          ${GoalForm.getFragment('goal')}
          ${DeleteGoalMutation.getFragment('goal')}
          ${UpdateGoalMutation.getFragment('goal')}

          name

          months(first: 100) {
            edges {
              node {
                id
                monthStart
                targetAmount
                filledAmount
              }
            }
          }
        }
      }
    `,
  },
});

export default CreateGoal;
