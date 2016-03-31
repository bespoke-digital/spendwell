
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import TextInput from 'components/text-input';
import Button from 'components/button';
import Dialog from 'components/dialog';

import { ConnectFinicityInstitutionMutation } from 'mutations/institutions';


class AddFinicityAccount extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { credentials: {}, disabledAccounts: {}, loading: false };
  }

  setFormValue(name, id, value) {
    const { credentials } = this.state;

    this.setState({
      credentials: Object.assign({}, credentials, { [id]: { value, name } }),
    });
  }

  toggleAccount(account) {
    const { disabledAccounts } = this.state;

    this.setState({
      disabledAccounts: Object.assign(disabledAccounts, { [account.id]: !disabledAccounts[account.id] }),
    });
  }

  handleSubmit() {
    const { viewer, finicityInstitution } = this.props;
    const { credentials } = this.state;

    Relay.Store.commitUpdate(new ConnectFinicityInstitutionMutation({
      viewer,
      finicityInstitution,
      credentials,
    }), {
      onFailure: ()=> console.log('Failure: ConnectFinicityInstitutionMutation'),
      onSuccess: ()=> {
        console.log('Success: ConnectFinicityInstitutionMutation');
      },
    });
  }

  render() {
    const { finicityInstitution, onRequestClose } = this.props;
    const { loading } = this.state;

    const formFields = _.sortBy(finicityInstitution.loginForm, 'displayOrder');

    return (
      <Dialog size='sm' onRequestClose={onRequestClose}>
        <div className='body'>
          <h3>Connect {finicityInstitution.name}</h3>

            {formFields.map((field)=>
              <TextInput
                key={field.name}
                label={field.description}
                onChange={this.setFormValue.bind(this, field.name, field.id)}
                type={field.name.indexOf('Password') !== -1 ? 'password' : 'text'}
              />
            )}
        </div>

        <div className='actions'>
          <Button onClick={onRequestClose}>Cancel</Button>
          <Button variant='primary' onClick={::this.handleSubmit} loading={loading}>
            Submit
          </Button>
        </div>
      </Dialog>
    );
  }
}


AddFinicityAccount = Relay.createContainer(AddFinicityAccount, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${ConnectFinicityInstitutionMutation.getFragment('viewer')}
      }
    `,
    finicityInstitution: ()=> Relay.QL`
      fragment on FinicityInstitution {
        ${ConnectFinicityInstitutionMutation.getFragment('finicityInstitution')}

        id
        finicityId
        name

        loginForm {
          id
          name
          description
          displayOrder
        }
      }
    `,
  },
});

export default AddFinicityAccount;
