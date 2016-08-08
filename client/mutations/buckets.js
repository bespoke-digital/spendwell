
import Relay from 'react-relay'

export class CreateBucketMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation () {
    return Relay.QL`mutation { createBucket }`
  }

  getVariables () {
    return {
      name: this.props.name,
      filters: this.props.filters,
      type: this.props.type,
      fixedAmount: this.props.fixedAmount,
      useFixedAmount: this.props.useFixedAmount,
    }
  }

  getFatQuery () {
    return Relay.QL`
      fragment on CreateBucketMutationPayload {
        viewer { dummy }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }]
  }
}

export class DeleteBucketMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    bucket: () => Relay.QL`
      fragment on BucketNode {
        id
      }
    `,
  };

  getMutation () {
    return Relay.QL`mutation { deleteBucket }`
  }

  getVariables () {
    return {
      bucketId: this.props.bucket.id,
    }
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DeleteBucketMutationPayload {
        viewer { dummy }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }]
  }
}

export class UpdateBucketMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    bucket: () => Relay.QL`
      fragment on BucketNode {
        id
      }
    `,
  };

  getMutation () {
    return Relay.QL`mutation { updateBucket }`
  }

  getVariables () {
    return {
      bucketId: this.props.bucket.id,
      name: this.props.name,
      filters: this.props.filters,
      fixedAmount: this.props.fixedAmount,
      useFixedAmount: this.props.useFixedAmount,
    }
  }

  getFatQuery () {
    return Relay.QL`
      fragment on UpdateBucketMutationPayload {
        viewer { dummy }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }]
  }
}

export class AutodetectBillsMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
  };

  getMutation () {
    return Relay.QL`mutation { autodetectBills }`
  }

  getVariables () {
    return {}
  }

  getFatQuery () {
    return Relay.QL`
      fragment on AutodetectBillsMutationPayload {
        viewer { dummy }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }]
  }
}
