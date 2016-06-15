
import _ from 'lodash'
import { Component } from 'react'
import Relay from 'react-relay'
import { browserHistory } from 'react-router'

import CardList from 'components/card-list'
import Card from 'components/card'
import Money from 'components/money'
import Institution from 'components/institution'
import App from 'components/app'
import ExternalAccounts from 'components/external-accounts'
import PrimaryFab from 'components/primary-fab'
import ListHeading from 'components/list-heading'
import Icon from 'components/icon'
import CreateBucketSheet from 'components/create-bucket-sheet'

import styles from 'sass/views/accounts'


class Accounts extends Component {
  state = {
    createExternalAccount: false,
  };

  render () {
    const { viewer, relay } = this.props
    const { createExternalAccount } = this.state

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

        <ExternalAccounts viewer={viewer}/>

        <PrimaryFab actions={[
          {
            label: 'New External Account',
            icon: <Icon type='open in new' color='light'/>,
            onClick: () => this.setState({ createExternalAccount: true }),
          },
          {
            default: true,
            label: 'New Bank',
            icon: <Icon type='account balance' color='light'/>,
            onClick: () => browserHistory.push('/app/accounts/new'),
          },
        ]}/>

        <CreateBucketSheet
          visible={createExternalAccount}
          onRequestClose={() => this.setState({ createExternalAccount: false })}
          onComplete={() => relay.forceFetch()}
          type='account'
          viewer={viewer}
        />
      </App>
    )
  }
}

Accounts = Relay.createContainer(Accounts, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${App.getFragment('viewer')}
        ${ExternalAccounts.getFragment('viewer')}
        ${Institution.getFragment('viewer')}
        ${CreateBucketSheet.getFragment('viewer')}

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

