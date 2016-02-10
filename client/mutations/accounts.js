
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
