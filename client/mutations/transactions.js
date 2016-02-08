
import Relay from 'react-relay';


export class UploadCsvMutation extends Relay.Mutation {
  static fragments = {
    account: ()=> Relay.QL`
      fragment on AccountNode {
        id,
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { uploadCsvMutation }`;
  }

  getVariables() {
    return {
      accountId: this.props.account.id,
      csv: this.props.csv,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UploadCsvMutation {
        account
        transactions
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        account: this.props.account.id,
      },
    }];
  }
}
