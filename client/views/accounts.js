
import { Component } from 'react';
import Relay from 'react-relay';

import Button from 'components/button';
import Institution from 'components/institution';

import styles from 'sass/views/accounts';


class Accounts extends Component {
  render() {
    const { viewer: { institutions } } = this.props;

    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <h1>Accounts</h1>
          <Button to='/app/accounts/add/plaid'>
            <i className='fa fa-plus'/>
            Add w/ Plaid
          </Button>
          <Button to='/app/accounts/add/upload'>
            <i className='fa fa-plus'/>
            Add w/ CSV
          </Button>
        </div>

        {institutions.edges.map(({ node })=>
          <Institution key={node.id} institution={node}/>
        )}
      </div>
    );
  }
}

Accounts = Relay.createContainer(Accounts, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        institutions(first: 10) {
          edges {
            node {
              ${Institution.getFragment('institution')}
              id
              name
            }
          }
        }
      }
    `,
  },
});

export default Accounts;

