
import { Component, PropTypes } from 'react'
import { browserHistory } from 'react-router'
import Relay from 'react-relay'
import moment from 'moment'

import { handleMutationError } from 'utils/network-layer'
import Money from 'components/money'
import CardList from 'components/card-list'
import Card from 'components/card'
import SuperCard from 'components/super-card'
import ListAccount from 'components/list-account'
import TextActions from 'components/text-actions'
import A from 'components/a'

import eventEmitter from 'utils/event-emitter'

import { DisableAccountMutation, EnableAccountMutation } from 'mutations/accounts'


class Institution extends Component {
  static propTypes = {
    isAdmin: PropTypes.bool,
  };

  static defaultProps = {
    isAdmin: false,
  };

  constructor () {
    super()
    this.state = { selected: null, showDisabled: false }
  }

  forceFetch () {
    eventEmitter.emit('forceFetch')
  }

  selectAccount ({ id }) {
    browserHistory.push({ pathname: `/accounts/${id}` })
  }

  enableAccount (account) {
    Relay.Store.commitUpdate(new EnableAccountMutation({ account }), {
      onFailure: handleMutationError,
      onSuccess: () => {
        console.log('Success: EnableAccountMutation')
        this.forceFetch()
      },
    })
  }

  disableAccount (account) {
    Relay.Store.commitUpdate(new DisableAccountMutation({ account }), {
      onFailure: handleMutationError,
      onSuccess: () => {
        console.log('Success: DisableAccountMutation')
        this.forceFetch()
      },
    })
  }

  render () {
    const { viewer, institution, isAdmin } = this.props
    const { selected, showDisabled } = this.state

    return (
      <CardList className='institution'>
        <Card summary={
          <div>
            {institution.logo ?
              <img src={institution.logo} alt={institution.name} className='institution-logo'/>
            : null}
            <h3>{institution.name}</h3>

            {isAdmin && institution.lastSync ?
              <div className='last-sync'>
                {moment(institution.lastSync).fromNow()}
              </div>
            : null}
          </div>
        }/>

        {institution.accounts.edges.map(({ node }) =>
          <ListAccount
            key={node.id}
            viewer={viewer}
            account={node}
            expanded={selected === node.id}
            onDisable={this.disableAccount.bind(this, node)}
            onClick={() => selected === node.id ?
              this.setState({ selected: null }) :
              this.setState({ selected: node.id })}
          />
        )}

        <Card summary={
          <div>
            <div><strong>Subtotal</strong></div>
            <div><Money amount={institution.currentBalance}/></div>
          </div>
        }/>

        {institution.disabledAccounts && institution.disabledAccounts.edges.length ?
          <SuperCard
            onSummaryClick={() => this.setState({ showDisabled: !showDisabled })}
            expanded={showDisabled}
            summary={<Card>Disabled Accounts</Card>}
            className='disabled'
          >
            {institution.disabledAccounts.edges.map(({ node }) =>
              <Card key={node.id} className='account'>
                <div>{node.name}</div>
                <TextActions>
                  <A onClick={this.enableAccount.bind(this, node)}>Enable</A>
                </TextActions>
              </Card>
            )}
          </SuperCard>
        : null}
      </CardList>
    )
  }
}

Institution = Relay.createContainer(Institution, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${ListAccount.getFragment('viewer')}
      }
    `,
    institution: () => Relay.QL`
      fragment on InstitutionNode {
        name
        canSync
        lastSync
        currentBalance
        logo

        accounts(first: 100, disabled: false) {
          edges {
            node {
              ${DisableAccountMutation.getFragment('account')}
              ${ListAccount.getFragment('account')}

              id
            }
          }
        }

        disabledAccounts: accounts(first: 100, disabled: true) {
          edges {
            node {
              ${EnableAccountMutation.getFragment('account')}

              id
              name
            }
          }
        }
      }
    `,
  },
})

export default Institution
