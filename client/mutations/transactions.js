
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


export class DetectTransfersMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id,
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { detectTransfers }`;
  }

  getVariables() {
    return {};
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DetectTransfersMutation {
        viewer {
          transactions
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


export class SetIncomeFromSavingsMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id,
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { setIncomeFromSavings }`;
  }

  getVariables() {
    return {
      month: this.props.month,
      amount: this.props.amount,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on SetIncomeFromSavingsMutation {
        viewer {
          safeToSpend

          summary {
            income
            fromSavingsIncome
            incomeEstimated
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
