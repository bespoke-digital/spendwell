
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
          <Button to='/app/accounts/add/upload' flat variant='primary'>
            New CSV
          </Button>
          <Button to='/app/accounts/add/plaid' flat variant='primary'>
            New Bank
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

