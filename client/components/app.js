
import { Component, PropTypes } from 'react'
import Relay from 'react-relay'
import { connect } from 'react-redux'

import Transition from 'components/transition'
import Header from 'components/header'
import Nav from 'components/nav'
import InstitutionReauth from 'components/institution-reauth'
import Progress from 'components/progress'
import Toasts from 'components/toasts'
import ShutdownNotice from 'components/shutdown-notice'

import eventEmitter from 'utils/event-emitter'
import style from 'sass/components/app'

class App extends Component {
  static propTypes = {
    loading: PropTypes.number.isRequired,
    chatlioOpen: PropTypes.bool.isRequired,
    onForceFetch: PropTypes.func,
    title: PropTypes.string,
    onOverlayClose: PropTypes.func,
    back: PropTypes.bool,
    className: PropTypes.string,
  };

  static defaultProps = {
    className: '',
  };

  state = { navOpen: false };

  constructor () {
    super()
    this.handleForceFetch = ::this.handleForceFetch
  }

  componentDidMount () {
    eventEmitter.addListener('forceFetch', this.handleForceFetch)
  }

  componentWillUnmount () {
    eventEmitter.removeListener('forceFetch', this.handleForceFetch)
  }

  handleForceFetch () {
    const { onForceFetch } = this.props

    if (onForceFetch) {
      onForceFetch()
    } else {
      console.warn('Unhandled forceFetch event')
    }
  }

  toggleNav () {
    const navOpen = !this.state.navOpen
    this.setState({ navOpen })
  }

  closeOverlay () {
    const { onOverlayClose } = this.props

    this.setState({ navOpen: false })

    if (onOverlayClose) onOverlayClose()
  }

  render () {
    const {
      children,
      viewer,
      back,
      loading,
      toasts,
      title,
      chatlioOpen,
      className,
    } = this.props
    const { navOpen } = this.state

    return (
      <div className={`${style.root} ${chatlioOpen ? 'chatlio-open' : ''}`}>
        {loading ? <Progress className='global-loading' indeterminate/> : null}

        <Header
          toggleNav={::this.toggleNav}
          viewer={viewer}
          back={back}
          title={title}
          chatlioOpen={chatlioOpen}
        />

        <Nav open={navOpen} toggleNav={::this.toggleNav} viewer={viewer}/>

        <Transition show={navOpen}>
          <div className='overlay nav-overlay' onClick={::this.closeOverlay}/>
        </Transition>

        <Toasts toasts={toasts}/>

        <div className={`app-container ${className}`}>
          <ShutdownNotice/>
          <InstitutionReauth viewer={viewer}/>
          {children}
        </div>
      </div>
    )
  }
}

App = connect((state) => ({
  loading: state.loading,
  toasts: state.toasts,
  chatlioOpen: state.chatlioOpen,
}))(App)

App = Relay.createContainer(App, {
  fragments: {
    viewer () {
      return Relay.QL`
        fragment on Viewer {
          ${Header.getFragment('viewer')}
          ${Nav.getFragment('viewer')}
          ${InstitutionReauth.getFragment('viewer')}
        }
      `
    },
  },
})

export default App
