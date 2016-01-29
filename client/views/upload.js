
import { Component } from 'react';
import { Form } from 'formsy-react';
import reactMixin from 'react-mixin';
import Papa from 'papaparse';

import Card from 'components/card';
import Input from 'components/forms/input';
import FileInput from 'components/forms/file';
import Select from 'components/forms/select';
import Button from 'components/button';

import Institutions from 'collections/institutions';
import Accounts from 'collections/accounts';
import Transactions from 'collections/transactions';

import style from 'sass/views/connect';


@reactMixin.decorate(ReactMeteorData)
export default class Connect extends Component {
  constructor() {
    super();
    this.state = {};
  }

  getMeteorData() {
    return {
      institutions: Institutions.find({ uploaded: true }).fetch(),
      accounts: Accounts.find({ uploaded: true }).fetch(),
      transactions: Transactions.find({ uploaded: true }).fetch(),
    };
  }

  submit({ institution, account, csvFile }) {
    Papa.parse(csvFile[0], { complete: (results)=> {
      Meteor.call('csvUpload', {
        institution,
        account,
        transactions: results.data,
      }, (error, { institution, account })=> {
        if (error) throw error;

        console.log('DONE: csvUpload');
        this.refs.form.reset({
          'institution.id': institution.id,
          'account.id': account.id,
        });
      });
    } });
  }

  render() {
    const { institutions, accounts, transactions } = this.data;
    const { newInstitution, newAccount } = this.state;

    accounts.forEach((account)=> {
      console.log(account);
      console.log(transactions.filter((t)=> t.account === account._id));
    });

    return (
      <div className={`container ${style.root}`}>
        <Button to='/app/accounts'>
          <i className='fa fa-arrow-circle-left'/>
        </Button>

        <h1>Upload Account</h1>

        <Card>
          <Form onValidSubmit={::this.submit} ref='form'>
            <Select
              name='institution.id'
              label='Institution'
              className={institutions.length ? '' : 'gone'}
              options={[
                { value: null, label: 'New' },
              ].concat(institutions.map((institution)=> (
                { value: institution._id, label: institution.name }
              )))}
              onChange={(val)=> this.setState({ newInstitution: !val })}
            />
            <Input
              name='institution.name'
              label='Institution Name'
              className={!institutions.length || newInstitution ? '' : 'gone'}
            />

            <Select
              name='account.id'
              label='account'
              className={accounts.length ? '' : 'gone'}
              options={[
                { value: null, label: 'New' },
              ].concat(accounts.map((account)=> (
                { value: account._id, label: account.name }
              )))}
              onChange={(val)=> this.setState({ newAccount: !val })}
            />
            <Input
              name='account.name'
              label='Account Name'
              className={!accounts.length || newAccount ? '' : 'gone'}
            />

            <FileInput name='csvFile' label='CSV' required={true}/>

            <Button type='submit' variant='primary'>Upload</Button>
          </Form>
        </Card>
      </div>
    );
  }
}
