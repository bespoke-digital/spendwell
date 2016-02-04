
import { Component } from 'react';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';

import Card from 'components/card';
import TextInput from 'components/text-input';
import FileInput from 'components/file-input';
import Dropdown from 'components/dropdown';
import Button from 'components/button';

import { UploadCsvMutation } from 'mutations/transactions';

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

  submit({ account, csvFile }) {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', function(event) {
      const csv = event.target.result;
      console.log('csvUpload', { account, csv });
      Relay.Store.commitUpdate(new UploadCsvMutation({ account, csv }));
    });
    fileReader.readAsText(csvFile[0]);
  }

  render() {
    const { viewer: { institutions } } = this.props;
    const { institution, account } = this.state;

    return (
      <div className={`container ${style.root}`}>
        <Button to='/app/accounts'>
          <i className='fa fa-arrow-circle-left'/>
        </Button>

        <h1>Upload Account</h1>

        <Card>
          <Dropdown label={institution ? institution.name : 'Institution'}>
            <a
              href='#'
              onClick={this.setState.bind(this, { institution: null }, null)}
            >New</a>
            {institutions.edges.map(({ node })=>
              <a
                key={node.id}
                href='#'
                onClick={this.setState.bind(this, { institution: node }, null)}
              >{node.name}</a>
            )}
          </Dropdown>

          {!institution ? (
            <TextInput
              label='Institution Name'
              onChange={(newInstitutionName)=> this.setState({ newInstitutionName })}
            />
          ) : null}

          {institution && institution.accounts.edges.length ? (
            <div>
              <Dropdown label={account ? account.name : 'Account'}>
                <a
                  href='#'
                  onClick={this.setState.bind(this, { account: null }, null)}
                >New</a>
                {institution.accounts.edges.map(({ node })=>
                  <a
                    key={node.id}
                    href='#'
                    onClick={this.setState.bind(this, { account: node }, null)}
                  >{node.name}</a>
                )}
              </Dropdown>

              {!account ? (
                <TextInput
                  label='Account Name'
                  onChange={(newAccountName)=> this.setState({ newAccountName })}
                />
              ) : null}
            </div>
          ) : null}

          <FileInput name='csvFile' label='CSV' required={true}/>

          <Button type='submit' variant='primary'>Upload</Button>
        </Card>
      </div>
    );
  }
}
