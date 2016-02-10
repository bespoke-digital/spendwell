
import Relay from 'react-relay';


export class CreateAccountMutation extends Relay.Mutation {
  static fragments = {
    institution: ()=> Relay.QL`
      fragment on InstitutionNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { createAccount }`;
  }

  getVariables() {
    return {
      name: this.props.name,
      institutionId: this.props.institution.id,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateAccountMutation {
        institution { accounts }
        accountEdge
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'institution',
      parentID: this.props.institution.id,
      connectionName: 'accounts',
      edgeName: 'accountEdge',
      rangeBehaviors: { '': 'append' },
    }];
  }

  getOptimisticResponse() {
    return {
      account: {
        name: this.props.name,
      },
    };
  }
}


export class DisableAccountMutation extends Relay.Mutation {
  static fragments = {
    account: ()=> Relay.QL`
      fragment on AccountNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { disableAccount }`;
  }

  getVariables() {
    return { accountId: this.props.account.id };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DisableAccountMutation {
        account {
          disabled
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


export class EnableAccountMutation extends Relay.Mutation {
  static fragments = {
    account: ()=> Relay.QL`
      fragment on AccountNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { enableAccount }`;
  }

  getVariables() {
    return { accountId: this.props.account.id };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on EnableAccountMutation {
        account {
          disabled
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
