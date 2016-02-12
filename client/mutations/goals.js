
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
        viewer { goals }
        goalEdge
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'viewer',
      parentID: this.props.viewer.id,
      connectionName: 'goals',
      edgeName: 'goalEdge',
      rangeBehaviors: { '': 'append' },
    }];
  }

  getOptimisticResponse() {
    return {
      goal: {
        name: this.props.name,
        monthlyAmount: this.props.monthlyAmount,
      },
    };
  }
}
