
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
      fragment on AssignTransactionsMutation {
        viewer {
          summary
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
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateBucketMutation {
        viewer {
          buckets
          summary {
            bucketMonths
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


export class GenerateBucketMonthMutation extends Relay.Mutation {
  static fragments = {
    bucket: ()=> Relay.QL`
      fragment on BucketNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { generateBucketMonth }`;
  }

  getVariables() {
    return {
      bucketId: this.props.bucket.id,
      month: this.props.month.format('YYYY/MM'),
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on GenerateBucketMonthMutation {
        bucket {
          months
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
}

