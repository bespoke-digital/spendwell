
import { Component } from 'react';
import { browserHistory } from 'react-router';
import Relay from 'react-relay';

import CardList from 'components/card-list';
import ListExternalAccount from 'components/list-external-account';


class ExternalAccounts extends Component {
  constructor() {
    super();
    this.state = { selected: null };
  }

  selectAccount({ id }) {
    browserHistory.push({ pathname: `/accounts/${id}` });
  }

  render() {
    const { viewer } = this.props;
    const { selected } = this.state;

    if (viewer.buckets.edges.length === 0)
      return null;

    return (
      <div>
        <div className='heading'>
          <h3>External Accounts</h3>
        </div>

        <CardList>
          {viewer.buckets.edges.map(({ node })=>
            <ListExternalAccount
              key={node.id}
              bucket={node}
              expanded={selected === node.id}
              onClick={()=> selected === node.id ?
                this.setState({ selected: null }) :
                this.setState({ selected: node.id })}
            />
          )}
        </CardList>
      </div>
    );
  }
}

ExternalAccounts = Relay.createContainer(ExternalAccounts, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        buckets(first: 100, type: "account") {
          edges {
            node {
              ${ListExternalAccount.getFragment('bucket')}

              id
            }
          }
        }
      }
    `,
  },
});

export default ExternalAccounts;
