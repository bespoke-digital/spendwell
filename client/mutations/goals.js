
import Relay from 'react-relay';


export class CreateGoalMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { createGoal }`;
  }

  getVariables() {
    return {
      name: this.props.name,
      monthlyAmount: this.props.monthlyAmount,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateGoalMutation {
        viewer {
          goals
          summary {
            goalMonths
          }
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }
}


export class UpdateGoalMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    goal: ()=> Relay.QL`
      fragment on GoalNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { updateGoal }`;
  }

  getVariables() {
    return {
      goalId: this.props.goal.id,
      name: this.props.name,
      monthlyAmount: this.props.monthlyAmount,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateGoalMutation {
        viewer {
          goals
          summary {
            allocated
            net
            goalMonths
          }
        }
        goal
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
        goal: this.props.goal.id,
      },
    }];
  }
}


export class DeleteGoalMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    goal: ()=> Relay.QL`
      fragment on GoalNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { deleteGoal }`;
  }

  getVariables() {
    return {
      goalId: this.props.goal.id,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DeleteGoalMutation {
        viewer {
          goals
          summary {
            goalMonths
            allocated
            net
          }
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }
}
