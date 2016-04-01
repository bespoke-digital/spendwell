
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import TextInput from 'components/text-input';
import Button from 'components/button';
import Dialog from 'components/dialog';

import { ConnectFinicityInstitutionMutation } from 'mutations/institutions';

import style from 'sass/components/finicity-account-dialog';


class FinicityAccountDialog extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    onConnected: PropTypes.func.isRequired,
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

  handleSubmit(event) {
    if (event) event.preventDefault();

    const { viewer, finicityInstitution, onConnected } = this.props;
    const { credentials } = this.state;

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new ConnectFinicityInstitutionMutation({
      viewer,
      finicityInstitution,
      credentials,
    }), {
      onFailure: (transaction)=> {
        this.setState({ loading: false });

        console.log('Failure: ConnectFinicityInstitutionMutation');
        const errors = transaction.getError().source.errors.map(({ message })=> message);
        if (errors.indexOf('Finicity MFA Required') !== -1)
          console.log('Finicity MFA Required');
      },
      onSuccess: ()=> {
        console.log('Success: ConnectFinicityInstitutionMutation');
        this.setState({ loading: false });
        onConnected();
      },
    });
  }

  render() {
    const { finicityInstitution, onRequestClose } = this.props;
    const { loading } = this.state;

    const formFields = _.sortBy(finicityInstitution.loginForm, 'displayOrder');

    console.log('render loading', loading);

    return (
      <Dialog size='sm' onRequestClose={onRequestClose} className={style.root}>
        <form onSubmit={::this.handleSubmit}>
          <div className='body'>
            <h3>Connect {finicityInstitution.name}</h3>

            {formFields.map((field)=>
              <div className='form-field' key={field.name}>
                <TextInput
                  label={field.description}
                  onChange={this.setFormValue.bind(this, field.name, field.id)}
                  type={field.name.indexOf('Password') !== -1 ? 'password' : 'text'}
                />
              </div>
            )}
          </div>

          <div className='actions'>
            <Button onClick={onRequestClose}>Cancel</Button>
            <Button loading={loading} variant='primary' type='submit'>Submit</Button>
          </div>
        </form>
      </Dialog>
    );
  }
}


FinicityAccountDialog = Relay.createContainer(FinicityAccountDialog, {
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

export default FinicityAccountDialog;
