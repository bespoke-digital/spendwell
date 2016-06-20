
import Relay from 'react-relay'


export class DisableAccountMutation extends Relay.Mutation {
  static fragments = {
    account: () => Relay.QL`
      fragment on AccountNode {
        id
      }
    `,
  };

  getMutation () {
    return Relay.QL`mutation { disableAccount }`
  }

  getVariables () {
    return {
      accountId: this.props.account.id,
      detectTransfers: this.props.detectTransfers,
    }
  }

  getFatQuery () {
    return Relay.QL`
      fragment on DisableAccountMutationPayload {
        account {
          disabled
        }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        account: this.props.account.id,
      },
    }]
  }

  getOptimisticResponse () {
    return {
      account: {
        id: this.props.account.id,
        disabled: true,
      },
    }
  }
}


export class EnableAccountMutation extends Relay.Mutation {
  static fragments = {
    account: () => Relay.QL`
      fragment on AccountNode {
        id
      }
    `,
  };

  getMutation () {
    return Relay.QL`mutation { enableAccount }`
  }

  getVariables () {
    return {
      accountId: this.props.account.id,
      sync: this.props.sync,
    }
  }

  getFatQuery () {
    return Relay.QL`
      fragment on EnableAccountMutationPayload {
        account {
          disabled
        }
      }
    `
  }

  getConfigs () {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        account: this.props.account.id,
      },
    }]
  }

  getOptimisticResponse () {
    return {
      account: {
        id: this.props.account.id,
        disabled: false,
      },
    }
  }
}
