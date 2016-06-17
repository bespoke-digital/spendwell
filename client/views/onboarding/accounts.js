
import _ from 'lodash'
import { Component } from 'react'
import Relay from 'react-relay'
import { browserHistory } from 'react-router'

import { handleMutationError } from 'utils/network-layer'
import Button from 'components/button'
import Onboarding from 'components/onboarding'
import CardList from 'components/card-list'
import Card from 'components/card'
import Money from 'components/money'
import GraphicDialog from 'components/graphic-dialog'
import Icon from 'components/icon'
import Transition from 'components/transition'
import TextActions from 'components/text-actions'
import A from 'components/a'

import { DisableAccountMutation, EnableAccountMutation } from 'mutations/accounts'

import connectImage from 'img/views/onboarding/connect.svg'
import styles from 'sass/views/onboarding-accounts'


class OnboardingAccounts extends Component {
  constructor () {
    super()
    this.state = { help: true }
  }

  continue () {
    browserHistory.push('/onboarding/walkthrough')
  }

  disable (account) {
    Relay.Store.commitUpdate(new DisableAccountMutation({ account, detectTransfers: false }), {
      onFailure: handleMutationError,
      onSuccess: () => console.log('Success: DisableAccountMutation'),
    })
  }

  enable (account) {
    Relay.Store.commitUpdate(new EnableAccountMutation({ account, sync: false }), {
      onFailure: handleMutationError,
      onSuccess: () => console.log('Success: EnableAccountMutation'),
    })
  }

  orderedAccounts (institution) {
    return _.sortBy(institution.accounts.edges.map(({ node }) => node), 'disabled')
  }

  render () {
    const { viewer } = this.props
    const { help } = this.state

    return (
      <Onboarding viewer={viewer}>

        <Transition show={help && viewer.institutions.edges.length < 2}>
          <GraphicDialog
            scheme='pink'
            image={connectImage}
            header={<span>Your Bank Has Been <br className='visible-xs'/>Succesfully Connected</span>}
            paragraph={`
              If you have any other accounts, make sure to add them before
              continuing. You can also disable any unwanted accounts (eg. business).
            `}
            next={
              <Button onClick={() => this.setState({ help: false })} fab><Icon type='done'/></Button>
            }
            onRequestClose={() => this.setState({ help: false })}
          />
        </Transition>

        <div className={`container skinny ${styles.root}`}>
          <div className='heading'>
            <h1>Bank Accounts</h1>
          </div>

          {viewer.institutions.edges.map(({ node }, index) =>
            <CardList className='institution' key={index}>
              <Card summary={<div><h3>{node.name}</h3></div>}/>

              {this.orderedAccounts(node).map((account) =>
                <Card key={account.id} className={`account ${account.disabled ? 'disabled' : ''}`}>
                  <div className='flex-row'>
                    <div>{account.name}</div>
                    <div><Money amount={account.currentBalance}/></div>
                  </div>
                  <TextActions>
                    <A onClick={account.disabled ?
                      this.enable.bind(this, account) :
                      this.disable.bind(this, account)
                    }>
                      {account.disabled ? 'Enable' : 'Disable'}
                    </A>
                  </TextActions>
                </Card>
              )}
            </CardList>
          )}

          <div className='flex-row'>
            <div/>
            <Button to='/onboarding/connect' flat>Add Another</Button>
            <Button onClick={::this.continue}>
              Next
            </Button>
          </div>
        </div>
      </Onboarding>
    )
  }
}

OnboardingAccounts = Relay.createContainer(OnboardingAccounts, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${Onboarding.getFragment('viewer')}

        institutions(first: 10) {
          edges {
            node {
              id
              name
              currentBalance

              accounts(first: 100) {
                edges {
                  node {
                    ${DisableAccountMutation.getFragment('account')}
                    ${EnableAccountMutation.getFragment('account')}

                    id
                    name
                    currentBalance
                    disabled
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

export default OnboardingAccounts

