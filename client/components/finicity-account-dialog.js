
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import TextInput from 'components/text-input';
import Button from 'components/button';
import Dialog from 'components/dialog';

import { ConnectFinicityInstitutionMutation } from 'mutations/finicity';

import style from 'sass/components/finicity-account-dialog';


class FinicityAccountDialog extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    onConnected: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { credentials: {}, mfaAnswers: [], loading: false };
  }

  setCredentialValue(name, id, value) {
    const { credentials } = this.state;

    console.log('change', value);

    this.setState({
      credentials: Object.assign({}, credentials, { [id]: { value, name } }),
    });
  }

  setMfaValue(challenge, index, value) {
    const { mfaAnswers } = this.state;
    mfaAnswers[index] = value;
    this.setState({ mfaAnswers });
  }

  handleSubmit(event) {
    const { viewer, finicityInstitution, onConnected } = this.props;
    const { credentials, mfaAnswers } = this.state;

    if (event) event.preventDefault();

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new ConnectFinicityInstitutionMutation({
      viewer,
      finicityInstitution,
      credentials,
      mfaAnswers,
    }), {
      onFailure: (transaction)=> {
        console.log('Failure: ConnectFinicityInstitutionMutation');

        this.setState({ loading: false });

        const mfaError = transaction.getError().source.errors.find(
          ({ message })=> message.indexOf('finicity-mfa-required:') === 0
        );

        if (mfaError) {
          const mfaChallenges = JSON.parse(mfaError.message.split(':').slice(1).join(':'));
          console.log('Finicity MFA Required', mfaChallenges);
          this.setState({ mfaChallenges });

          return;
        }

        const mfaExpired = transaction.getError().source.errors.find(
          ({ message })=> message.indexOf('finicity-mfa-expired') === 0
        );

        if (mfaExpired)
          this.setState({ mfaChallenges: null });
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
    const { loading, mfaChallenges, credentials, mfaAnswers } = this.state;

    const formFields = _.sortBy(finicityInstitution.loginForm, 'displayOrder');

    console.log('render', _.values(credentials).map(({ value })=> value));

    return (
      <Dialog size='sm' onRequestClose={onRequestClose} className={style.root}>
        <form onSubmit={::this.handleSubmit}>
          <div className='body'>
            <h3>Connect {finicityInstitution.name}</h3>

            {mfaChallenges ? mfaChallenges.map((challenge, index)=>
              <div className='form-field' key={index}>
                {challenge.text ? <strong>{challenge.text}</strong> : null}
                <TextInput
                  label='Answer'
                  onChange={this.setMfaValue.bind(this, challenge, index)}
                  value={mfaAnswers[index] || ''}
                />
              </div>
            ) : formFields.map((field)=>
              <div className='form-field' key={field.name}>
                <TextInput
                  label={field.description}
                  onChange={this.setCredentialValue.bind(this, field.name, field.id)}
                  type={field.name.indexOf('Password') !== -1 ? 'password' : 'text'}
                  value={credentials[field.id] ? credentials[field.id].value : ''}
                />
              </div>
            )}
          </div>

          <div className='actions'>
            <Button onClick={onRequestClose}>Cancel</Button>
            <Button variant='primary' type='submit' loading={loading}>Submit</Button>
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
