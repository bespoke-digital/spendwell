
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import FileInput from 'components/file-input';
import Dropdown from 'components/dropdown';
import Button from 'components/button';
import CreateAccount from 'components/create-account';
import CreateInstitution from 'components/create-institution';

import { UploadCsvMutation } from 'mutations/transactions';

import style from 'sass/views/add-csv';


class AddCsv extends Component {
  static contextTypes = {
    history: React.PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { accounts: { edges: [] } };
  }

  submit() {
    const { account, csvFile } = this.state;

    const fileReader = new FileReader();
    fileReader.addEventListener('load', function(event) {
      const csv = event.target.result;
      console.log('csvUpload', { account, csv });
      Relay.Store.commitUpdate(new UploadCsvMutation({ account, csv }));
    });
    fileReader.readAsText(csvFile);
  }

  render() {
    const { viewer } = this.props;
    const { institution, account, newAccount, newInstitution } = this.state;

    return (
      <div className={`container ${style.root}`}>
        <div className='heading'>
          <Button onClick={()=> this.context.history.goBack()} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>Upload Account</h1>
        </div>

        <Card>
          <div>
            <Dropdown label={institution ? institution.name : 'Institution'}>
              <a
                href='#'
                onClick={this.setState.bind(this, { institution: null }, null)}
                onClick={this.setState.bind(this, { newInstitution: true, account: null }, null)}
              >New</a>
              {viewer.institutions.edges.map(({ node })=>
                <a
                  key={node.id}
                  href='#'
                  onClick={this.setState.bind(this, { institution: node }, null)}
                >{node.name}</a>
              )}
            </Dropdown>
          </div>

          {viewer ?
            <CreateInstitution
              viewer={viewer}
              open={!!newInstitution}
              onClose={this.setState.bind(this, { newInstitution: false }, null)}
            />
          : null}

          <div>
            {institution && institution.accounts ? (
              <Dropdown label={account ? account.name : 'Account'}>
                <a
                  href='#'
                  onClick={this.setState.bind(this, { newAccount: true, account: null }, null)}
                >New</a>
                {institution.accounts.edges.map(({ node })=>
                  <a
                    key={node.id}
                    href='#'
                    onClick={this.setState.bind(this, { account: node }, null)}
                  >{node.name}</a>
                )}
              </Dropdown>
            ) : null}
          </div>

          {institution ?
            <CreateAccount
              institution={institution}
              open={!!newAccount}
              onClose={this.setState.bind(this, { newAccount: false }, null)}
            />
          : null}

          <FileInput label='CSV' onChange={(files)=> this.setState({ csvFile: files[0] })}/>

          <Button
            type='submit'
            variant='primary'
            onClick={::this.submit}
          >Upload</Button>
        </Card>
      </div>
    );
  }
}

AddCsv = Relay.createContainer(AddCsv, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${CreateInstitution.getFragment('viewer')}
        institutions(first: 100) {
          edges {
            node {
              ${CreateAccount.getFragment('institution')}
              id
              name
              accounts(first: 100) {
                edges {
                  node {
                    ${UploadCsvMutation.getFragment('account')}
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
});

export default AddCsv;
