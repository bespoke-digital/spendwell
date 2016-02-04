
import { Component } from 'react';
import Papa from 'papaparse';
import Relay from 'react-relay';
import relayContainer from 'relay-decorator';

import Card from 'components/card';
import TextInput from 'components/text-input';
import FileInput from 'components/file-input';
import Dropdown from 'components/dropdown';
import Button from 'components/button';

import style from 'sass/views/connect';


// class UploadCsvMutation extends Relay.Mutation {
//   // prop dependency
//   static fragments = {
//     account: ()=> Relay.QL`
//       fragment on Account {
//         id,
//       }
//     `,
//   };

//   // the GQL mutation
//   getMutation() {
//     return Relay.QL`mutation { uploadCsv }`;
//   }

//   // the GQL mutation input vars
//   getVariables() {
//     return {
//       accountId: this.props.account.id,
//       csv: this.props.csv,
//     };
//   }

//   // Data that could change as a result of the mutation
//   getFatQuery() {
//     return Relay.QL`
//       fragment on UploadCsvPayload {
//         account {
//           edges
//         },
//       }
//     `;
//   }
//   // These configurations advise Relay on how to handle the UploadCsvPayload
//   // returned by the server. Here, we tell Relay to use the payload to
//   // change the fields of a record it already has in the store. The
//   // key-value pairs of ‘fieldIDs’ associate field names in the payload
//   // with the ID of the record that we want updated.
//   getConfigs() {
//     return [{
//       type: 'FIELDS_CHANGE',
//       fieldIDs: {
//         account: this.props.account.id,
//       },
//     }];
//   }
// }


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
    Papa.parse(csvFile[0], { complete: (results)=> {
      console.log('csvUpload', { account, csv: results.data });
      // Relay.Store.commitUpdate(
      //   new UploadCsvMutation({ account, csv: results.data }),
      // );
    } });
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
