
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
    return { month: this.props.month.format('YYYY/MM') };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DeleteBucketMutation {
        viewer {
          summary {
            transactions
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


export class CreateBucketMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { createBucket }`;
  }

  getVariables() {
    return {
      name: this.props.name,
      filters: this.props.filters,
      type: this.props.type,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateBucketMutation {
        viewer {
          summary {
            billsUnpaidTotal
            billsPaidTotal
            allocated
            spent
            net
            spentFromSavings
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


export class DeleteBucketMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    bucket: ()=> Relay.QL`
      fragment on BucketNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { deleteBucket }`;
  }

  getVariables() {
    return {
      bucketId: this.props.bucket.id,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DeleteBucketMutation {
        viewer {
          summary {
            billsUnpaidTotal
            billsPaidTotal
            allocated
            spent
            net
            spentFromSavings
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


export class UpdateBucketMutation extends Relay.Mutation {
  static fragments = {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    bucket: ()=> Relay.QL`
      fragment on BucketNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { updateBucket }`;
  }

  getVariables() {
    return {
      bucketId: this.props.bucket.id,
      name: this.props.name,
      type: this.props.type,
      filters: this.props.filters,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateBucketMutation {
        bucket {
          name
          type
          filters
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        bucket: this.props.bucket.id,
      },
    }];
  }

  getOptimisticResponse() {
    return {
      bucket: {
        id: this.props.bucket.id,
        name: this.props.bucket.name,
        type: this.props.bucket.type,
        filters: this.props.bucket.filters,
      },
    };
  }
}
