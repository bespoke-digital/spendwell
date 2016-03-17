
import Relay from 'react-relay';


export class SetIncomeEstimateMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id,
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { setIncomeEstimate }`;
  }

  getVariables() {
    return { amount: this.props.amount };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on SetIncomeEstimateMutation {
        viewer {
          summary {
            income
            incomeEstimated
            estimatedIncome
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