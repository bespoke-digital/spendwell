
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
        institutions(first: 100) {
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
    this.state = { accounts: { edges: [] } };
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
  handleInstitutionChange(id) {
    const { viewer: { institutions } } = this.props;
    const institution = institutions.edges.find(({ node })=> node.id === id);
    this.setState({
      newInstitution: !id,
      accounts: institution ? institution.node.accounts : { edges: [] },
    });
  }

  render() {
    const { viewer: { institutions } } = this.props;
    const { newInstitution, newAccount, accounts } = this.state;

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
              ].concat(institutions.edges.map(({ node })=> (
                { value: node.id, label: node.name }
              )))}
              onChange={::this.handleInstitutionChange}
            />
            <Input
              name='institution.name'
              label='Institution Name'
              className={!institutions.edges.length || newInstitution ? '' : 'gone'}
            />

            <Select
              name='account.id'
              label='account'
              className={accounts.edges.length ? '' : 'gone'}
              options={[
                { value: null, label: 'New' },
              ].concat(accounts.edges.map(({ node })=> (
                { value: node.id, label: node.name }
              )))}
              onChange={(val)=> this.setState({ newAccount: !val })}
            />
            <Input
              name='account.name'
              label='Account Name'
              className={!accounts.edges.length || newAccount ? '' : 'gone'}
            />

            <FileInput name='csvFile' label='CSV' required={true}/>

            <Button type='submit' variant='primary'>Upload</Button>
          </Form>
        </Card>
      </div>
    );
  }
}
