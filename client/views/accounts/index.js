
import { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';

import Button from 'components/button';
import Institutions from 'collections/institutions';
import styles from 'sass/views/accounts';

import AccountList from './account-list';


@reactMixin.decorate(ReactMeteorData)
export default class InstitutionsView extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { finicitySyncing: false };
  }

  getMeteorData() {
    return {
      plaidInstitutions: Institutions.find({ plaidId: { $exists: true } }).fetch(),
      finicityInstitutions: Institutions.find({ finicityId: { $exists: true } }).fetch(),
      uploadedInstitutions: Institutions.find({ uploaded: true }).fetch(),
    };
  }

  syncInstitution({ plaidId }) {
    Meteor.call('syncInstitution', { plaidId }, console.log.bind(console, 'syncInstitution SUCCESS'));
  }

  finicitySync() {
    this.setState({ finicitySyncing: true });
    Meteor.call('finicitySync', ()=> this.setState({ finicitySyncing: false }));
  }

  csvRemoveAll() {
    Meteor.call('csvRemoveAll', console.log.bind(console, 'csvRemoveAll SUCCESS'));
  }

  render() {
    const { params, history } = this.props;
    const { finicitySyncing } = this.state;
    const {
      plaidInstitutions,
      finicityInstitutions,
      uploadedInstitutions,
    } = this.data;

    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <h1>Accounts</h1>
        </div>

        <div className='heading'>
          <h2>External Savings</h2>

          <div>
            <Button to='/connect/external'>
              <i className='fa fa-plus'/>
            </Button>
          </div>
        </div>

        <div className='heading'>
          <h2>Uploaded</h2>

          <div>
            <Button to='/connect/upload'>
              <i className='fa fa-plus'/>
            </Button>
            <Button onClick={::this.csvRemoveAll}>
              <i className='fa fa-trash-o'/>
            </Button>
          </div>
        </div>

        {uploadedInstitutions.map((institution)=> (
          <div key={institution._id}>
            <div className='heading'>
              <h3>{institution.name}</h3>
            </div>
            <AccountList history={history} params={params} institution={institution}/>
          </div>
        ))}

        <div className='heading'>
          <h2>Plaid</h2>
          <div>
            <Button to='/connect/plaid'>
              <i className='fa fa-plus'/>
            </Button>
          </div>
        </div>

        {plaidInstitutions.map((institution)=> (
          <div key={institution._id}>
            <div className='heading'>
              <h3>{institution.name}</h3>
              <div>
                <Button onClick={this.syncInstitution.bind(this, institution)}>
                  <i className='fa fa-refresh'/>
                </Button>
              </div>
            </div>
            <AccountList history={history} params={params} institution={institution}/>
          </div>
        ))}

        <div className='heading'>
          <h2>Finicity</h2>

            <div>
              <Button to='/connect/finicity'>
                <i className='fa fa-plus'/>
              </Button>
              {finicityInstitutions.length > 0 ?
                <Button onClick={::this.finicitySync}>
                  <i className={`fa fa-refresh ${finicitySyncing ? 'fa-spin' : ''}`}/>
                </Button>
              : null}
            </div>
        </div>

        {finicityInstitutions.map((institution)=> (
          <div key={institution._id}>
            <div className='heading'>
              <h3>{institution.name}</h3>
            </div>
            <AccountList history={history} params={params} institution={institution}/>
          </div>
        ))}

      </div>
    );
  }
}
