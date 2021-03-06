
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'
import Row from 'muicss/lib/react/row'
import Col from 'muicss/lib/react/col'

import ConnectAccount from 'components/connect-account'
import Onboarding from 'components/onboarding'
import Button from 'components/button'
import GraphicDialog from 'components/graphic-dialog'
import Icon from 'components/icon'
import Transition from 'components/transition'

import welcomeImage from 'img/views/onboarding/welcome.svg'
import securityImage from 'img/views/onboarding/security.svg'
import anonymityImage from 'img/views/onboarding/anonymity.svg'
import privacyImage from 'img/views/onboarding/privacy.svg'

import connectStyles from 'sass/views/add-plaid.scss'
import style from 'sass/views/onboarding/add-account.scss'

class AddAccountView extends Component {
  static propTypes = {
    viewer: PropTypes.object,
  };

  state = {
    help: true,
  };

  render () {
    const { viewer } = this.props
    const { help } = this.state
    const hasInstitutions = !!viewer.institutions.edges.length

    return (
      <Onboarding viewer={viewer}>
        <Transition show={!!(help && !hasInstitutions)}>
          <GraphicDialog
            scheme='green'
            image={welcomeImage}
            header='Welcome To Spendwell'
            paragraph={`
              Get started by connecting your accounts. It's important that
              you connect all accounts where money comes in or is spent.
            `}
            next={
              <Button onClick={() => this.setState({ help: false })} fab><Icon type='done'/></Button>
            }
            onRequestClose={() => this.setState({ help: false })}
          />
        </Transition>

        <div className={style.root}>
          <div className='heading'>
            <h1>Connect Accounts</h1>
          </div>

          <ConnectAccount viewer={viewer}/>

          <div className='flex-row'>
            <div/>
            {hasInstitutions ?
              <Button to='/onboarding/accounts'>Skip</Button>
            : null}
          </div>
        </div>
      </Onboarding>
    )
  }
}

AddAccountView = Relay.createContainer(AddAccountView, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${Onboarding.getFragment('viewer')}
        ${ConnectAccount.getFragment('viewer')}

        institutions(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
  },
})

export default AddAccountView
