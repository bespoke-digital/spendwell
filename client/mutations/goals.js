
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
