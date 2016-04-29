
import Relay from 'react-relay';


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


export class TransactionQuickAddMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id,
      }
    `,
    transaction: ()=> Relay.QL`
      fragment on TransactionNode {
        id,
      }
    `,
    bucket: ()=> Relay.QL`
      fragment on BucketNode {
        id,
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { transactionQuickAdd }`;
  }

  getVariables() {
    return {
      transactionId: this.props.transaction.id,
      bucketId: this.props.bucket ? this.props.bucket.id : null,
      bucketName: this.props.bucketName,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on TransactionQuickAddMutation {
        transaction {
          buckets
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        transaction: this.props.transaction.id,
      },
    }];
  }
}

export class UploadCsvMutation extends Relay.Mutation {
  static fragments = {
    account: ()=> Relay.QL`
      fragment on AccountNode {
        id,
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { uploadCsv }`;
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
        account {
          transactions
        }
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


export class DeleteTransactionMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    transaction: ()=> Relay.QL`
      fragment on TransactionNode {
        id

        account {
          id
        }

        buckets(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { deleteTransaction }`;
  }

  getVariables() {
    return {
      transactionId: this.props.transaction.id,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DeleteTransactionMutation {

        account {
          transactions
        }

        buckets {
          transactions
        }

        viewer {
          transactions

          summary {
            transactions
          }
        }
      }
    `;
  }

  getConfigs() {
    const { viewer, transaction } = this.props;

    const configs = [{
      type: 'NODE_DELETE',
      parentName: 'account',
      parentID: transaction.account.id,
      connectionName: 'transactions',
      deletedIDFieldName: 'transactionId',
    }, {
      type: 'NODE_DELETE',
      parentName: 'viewer',
      parentID: viewer.id,
      connectionName: 'transactions',
      deletedIDFieldName: 'transactionId',
    }];

    configs.concat(transaction.buckets.edges.map(({ node })=> ({
      type: 'NODE_DELETE',
      parentName: 'buckets',
      parentID: node.id,
      connectionName: 'transactions',
      deletedIDFieldName: 'transactionId',
    })));

    return configs;
  }
}
