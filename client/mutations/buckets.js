
import Relay from 'react-relay';


export class AssignTransactionsMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id,
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { assignTransactions }`;
  }

  getVariables() {
    return { month: this.props.month_start };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on AssignTransactionsMutation {
        viewer {
          summary(month: $month)
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
