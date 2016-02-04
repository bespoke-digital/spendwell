
import Relay from 'react-relay';


export class AddInstitutionMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { addInstitution }`;
  }

  getVariables() {
    return { name: this.props.name };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on AddInstitutionMutation {
        institution
      }
    `;
  }
}
