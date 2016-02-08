
import Relay from 'react-relay';


export class AddAccountMutation extends Relay.Mutation {
  static fragments = {
    institution: ()=> Relay.QL`
      fragment on InstitutionNode {
        id
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { addAccount }`;
  }

  getVariables() {
    return {
      name: this.props.name,
      institutionId: this.props.institution.id,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on AddAccountMutation {
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
