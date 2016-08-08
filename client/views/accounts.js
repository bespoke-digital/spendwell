
import _ from 'lodash'
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'
import { browserHistory } from 'react-router'

import CardList from 'components/card-list'
import Card from 'components/card'
import Money from 'components/money'
import Institution from 'components/institution'
import App from 'components/app'
import PrimaryFab from 'components/primary-fab'
import ListHeading from 'components/list-heading'
import Icon from 'components/icon'

import styles from 'sass/views/accounts'


class Accounts extends Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired,
  };

  render () {
    const { viewer, relay } = this.props

    return (
      <App
        viewer={viewer}
        title='Accounts'
        className={`${styles.root}`}
        onForceFetch={relay.forceFetch}
      >
        {viewer.institutions.edges.map(({ node }) =>
          <Institution
            key={node.id}
            viewer={viewer}
            institution={node}
            isAdmin={viewer.isAdmin}
          />
        )}

        <CardList>
          <Card summary={
            <div>
              <div><strong>Total</strong></div>
              <div><Money amount={_.sum(
                viewer.institutions.edges,
                ({ node }) => node.currentBalance
              )}/></div>
            </div>
          }/>
        </CardList>

        <ListHeading>External Accounts</ListHeading>

        <PrimaryFab actions={[
          {
            default: true,
            label: 'New Bank',
            icon: <Icon type='account balance' color='light'/>,
            onClick: () => browserHistory.push('/app/accounts/new'),
          },
        ]}/>
      </App>
    )
  }
}

Accounts = Relay.createContainer(Accounts, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${Institution.getFragment('viewer')}

        isAdmin

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
})

export default Accounts

