
import _ from 'lodash';
import { Component } from 'react';
import Relay from 'react-relay';

import CardList from 'components/card-list';
import Card from 'components/card';
import Money from 'components/money';
import Button from 'components/button';
import Institution from 'components/institution';
import App from 'components/app';

import styles from 'sass/views/accounts';


class Accounts extends Component {
  render() {
    const { viewer } = this.props;

    return (
      <App viewer={viewer}>
        <div className={`container ${styles.root}`}>
          <div className='heading'>
            <h1>Accounts</h1>
            <Button to='/app/accounts/add/plaid' flat variant='primary'>
              New Bank
            </Button>
          </div>

          {viewer.institutions.edges.map(({ node })=>
            <Institution key={node.id} institution={node}/>
          )}

          <CardList>
            <Card summary={
              <div>
                <div><strong>Total</strong></div>
                <div><Money amount={_.sum(
                  viewer.institutions.edges,
                  ({ node })=> node.currentBalance
                )}/></div>
              </div>
            }/>
          </CardList>
        </div>
      </App>
    );
  }
}

Accounts = Relay.createContainer(Accounts, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        institutions(first: 10) {
          edges {
            node {
              ${Institution.getFragment('institution')}
              id
              name
              currentBalance
            }
          }
        }
      }
    `,
  },
});

export default Accounts;

