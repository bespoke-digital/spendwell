
import _ from 'lodash';
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';

import { handleMutationError } from 'utils/network-layer';
import TextInput from 'components/text-input';
import Button from 'components/button';
import Dialog from 'components/dialog';
import DialogActions from 'components/dialog-actions';

import track from 'utils/track';
import { ConnectFinicityInstitutionMutation } from 'mutations/finicity';

import style from 'sass/components/finicity-account-dialog';


class FinicityAccountDialog extends Component {
  static propTypes = {
    onRequestClose: PropTypes.func.isRequired,
    onConnected: PropTypes.func.isRequired,
    onConnecting: PropTypes.func,
    fullSync: PropTypes.bool,
  };

  static defaultProps = {
    fullSync: false,
  };

  constructor() {
    super();
    this.state = { credentials: {}, mfaAnswers: [], loading: false };
  }

  setCredentialValue(name, id, value) {
    const { credentials } = this.state;
    this.setState({
      credentials: Object.assign({}, credentials, { [id]: { value, name } }),
    });
  }

  setMfaValue(challenge, index, value, event) {
    if (event) event.preventDefault();

    const { mfaAnswers } = this.state;
    mfaAnswers[index] = value;
    this.setState({ mfaAnswers });
  }

  handleSubmit(event) {
    if (event) event.preventDefault();

    const { viewer, finicityInstitution, onConnected, onConnecting, fullSync } = this.props;
    const { credentials, mfaAnswers } = this.state;

    if (onConnecting)
      onConnecting();

    this.setState({ loading: true });
    Relay.Store.commitUpdate(new ConnectFinicityInstitutionMutation({
      viewer,
      finicityInstitution,
      credentials,
      mfaAnswers,
      fullSync,
    }), {
      onFailure: (transaction)=> {
        console.log('Failure: ConnectFinicityInstitutionMutation');

        this.setState({ loading: false });

        const errors = transaction.getError().source.errors;
        const error = (testMessage)=> errors.find(({ message })=> message.indexOf(testMessage) === 0);

        const mfaError = error('finicity-mfa-required');
        const mfaExpired = error('finicity-mfa-expired');
        const invalidCredentials = error('finicity-invalid-credentials');
        const userActionRequired = error('finicity-user-action-required');

        if (mfaError) {
          const mfaChallenges = JSON.parse(mfaError.message.split(':').slice(1).join(':'));
          console.log('Finicity MFA Required', mfaChallenges);
          this.setState({
            mfaChallenges,
            invalidCredentials: !!invalidCredentials,
            userActionRequired: !!userActionRequired,
          });

        } else if (mfaExpired) {
          this.setState({
            mfaChallenges: null,
            invalidCredentials: !!invalidCredentials,
            userActionRequired: !!userActionRequired,
          });

        } else {
          this.setState({
            invalidCredentials: !!invalidCredentials,
            userActionRequired: !!userActionRequired,
          });

          if (!invalidCredentials && !userActionRequired)
            handleMutationError(transaction);
        }
      },
      onSuccess: ()=> {
        console.log('Success: ConnectFinicityInstitutionMutation');

        this.setState({
          loading: false,
          invalidCredentials: false,
          userActionRequired: false,
        });

        onConnected();

        track('account-connected', { type: 'Finicity' });
      },
    });
  }

  render() {
    const { finicityInstitution, onRequestClose } = this.props;
    const {
      loading,
      mfaChallenges,
      credentials,
      mfaAnswers,
      invalidCredentials,
      userActionRequired,
    } = this.state;

    const formFields = _.sortBy(finicityInstitution.loginForm, 'displayOrder');

    return (
      <Dialog size='sm' onRequestClose={onRequestClose} className={style.root}>
        <form onSubmit={::this.handleSubmit}>
          <div className='body'>
            <h3>Connect {finicityInstitution.name}</h3>

            {invalidCredentials ?
              <span className='form-error'>
                We're having trouble connecting to your account with this
                login information.
              </span>
            : userActionRequired ?
              <span className='form-error'>
                You need to login to your bank and complete an action to continue.
              </span>
            : null}

            {mfaChallenges ? mfaChallenges.map((challenge, index)=>
              <div className='form-field' key={index}>
                {challenge.image ?
                  <div className='mfa-question'><img src={challenge.image} alt={challenge.text}/></div>
                : null}

                {(challenge.choice || challenge.imageChoice) && challenge.text ?
                  <div className='mfa-question'><strong>{challenge.text}</strong></div>
                : null}

                {challenge.choice ?
                  <ul className='mfa-choices'>
                    {challenge.choice.map((choice)=>
                      <li key={choice['@value']}>
                        {mfaAnswers[index] === choice['@value'] ?
                          <i className='fa fa-dot-circle-o'/>
                        :
                          <i className='fa fa-circle-o'/>
                        }
                        <a href='#' onClick={this.setMfaValue.bind(this, challenge, index, choice['@value'])}>
                          {choice['#text']}
                        </a>
                      </li>
                    )}
                  </ul>
                : challenge.imageChoice ?
                  <ul className='mfa-choices'>
                    {challenge.imageChoice.map((choice)=>
                      <li key={choice['@value']}>
                        {mfaAnswers[index] === choice['@value'] ?
                          <i className='fa fa-dot-circle-o'/>
                        :
                          <i className='fa fa-circle-o'/>
                        }
                        <a href='#' onClick={this.setMfaValue.bind(this, challenge, index, choice['@value'])}>
                          <img src={choice['#text']} alt={choice['@value']}/>
                        </a>
                      </li>
                    )}
                  </ul>
                :
                  <TextInput
                    label={challenge.text ? challenge.text : 'Answer'}
                    onChange={this.setMfaValue.bind(this, challenge, index)}
                    value={mfaAnswers[index] || ''}
                  />
                }
              </div>
            ) : formFields.map((field)=>
              <div className='form-field' key={field.name}>
                <TextInput
                  label={field.description}
                  onChange={this.setCredentialValue.bind(this, field.name, field.id)}
                  type={field.mask ? 'password' : 'text'}
                  value={credentials[field.id] ? credentials[field.id].value : ''}
                />
              </div>
            )}
          </div>

          <DialogActions>
            <Button onClick={onRequestClose}>Cancel</Button>
            <Button type='submit' loading={loading}>Submit</Button>
          </DialogActions>
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
      fragment on FinicityInstitutionNode {
        ${ConnectFinicityInstitutionMutation.getFragment('finicityInstitution')}

        id
        finicityId
        name

        loginForm {
          id
          name
          description
          displayOrder
          mask
        }
      }
    `,
  },
});

export default FinicityAccountDialog;
