
import Relay from 'react-relay';


export class AddAccountMutation extends Relay.Mutation {
  static fragments = {
    story: ()=> Relay.QL`
      fragment on InstitutionNode {
        id
        accounts
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
        account
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'institution',
      parentID: this.props.institution.id,
      connectionName: 'accounts',
      edgeName: 'account',
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
