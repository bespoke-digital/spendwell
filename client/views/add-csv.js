
import { Component } from 'react';
import { Form } from 'formsy-react';
import Papa from 'papaparse';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';

import Card from 'components/card';
import Input from 'components/forms/input';
import FileInput from 'components/forms/file';
import Select from 'components/forms/select';
import Button from 'components/button';

import style from 'sass/views/connect';


@relayContainer({
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        institutions(first: 100, uploaded: true) {
          edges {
            node {
              id
              name
              accounts(first: 100) {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
})
export default class AddCsv extends Component {
  constructor() {
    super();
    this.state = {};
  }

  submit({ institution, account, csvFile }) {
    Papa.parse(csvFile[0], { complete: (results)=> {
      console.log('csvUpload', {
        institution,
        account,
        transactions: results.data,
      });
    } });
  }

  render() {
    const { institutions } = this.props.viewer;
    const { newInstitution, newAccount } = this.state;

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
              className={institutions.edges.length ? '' : 'gone'}
              options={[
                { value: null, label: 'New' },
              ].concat(institutions.edges.map((edge)=> (
                { value: edge.node.id, label: edge.node.name }
              )))}
              onChange={(val)=> this.setState({ newInstitution: !val })}
            />
            <Input
              name='institution.name'
              label='Institution Name'
              className={!institutions.edges.length || newInstitution ? '' : 'gone'}
            />
{/*
            <Select
              name='account.id'
              label='account'
              className={accounts.length ? '' : 'gone'}
              options={[
                { value: null, label: 'New' },
              ].concat(accounts.edges.map((edge)=> (
                { value: edge.node.id, label: edge.node.name }
              )))}
              onChange={(val)=> this.setState({ newAccount: !val })}
            />
            <Input
              name='account.name'
              label='Account Name'
              className={!accounts.length || newAccount ? '' : 'gone'}
            />
*/}
            <FileInput name='csvFile' label='CSV' required={true}/>

            <Button type='submit' variant='primary'>Upload</Button>
          </Form>
        </Card>
      </div>
    );
  }
}
