
import { PropTypes, Component } from 'react';
import Relay from 'react-relay';
import { Link, browserHistory } from 'react-router';

import OnboardProgress from 'components/onboard-progress';

import logoIconWhite from 'img/logo-icon-white.svg';

import style from 'sass/components/header';


class Header extends Component {
  static propTypes = {
    title: PropTypes.string,
    toggleNav: PropTypes.func,
    plain: PropTypes.bool,
    back: PropTypes.bool,
  };

  static defaultProps = {
    title: '',
    plain: false,
    back: false,
  };

  handleHandleClick(event) {
    event.preventDefault();
    if (this.props.toggleNav)
      this.props.toggleNav();
  }

  handleBackClick(event) {
    event.preventDefault();
    browserHistory.goBack();
  }

  render() {
    const { viewer, back, plain, title } = this.props;

    return (
      <nav className={`mui-appbar ${style.root}`}>
        {!plain ? <div className='title'>{title}</div> : null}

        {!plain ?
          <div className='nav-handle mui--appbar-height mui--appbar-line-height'>
            {back ? (
              <a href='#' onClick={::this.handleBackClick}>
                <i className='fa fa-long-arrow-left'/>
              </a>
            ) : (
              <a href='#' onClick={::this.handleHandleClick}>
                <i className='fa fa-bars'/>
              </a>
            )}
          </div>
        : null}

        {!plain ?
          <Link className='brand mui--appbar-height mui--appbar-line-height' to='/app/dashboard'>
            <img src={logoIconWhite} alt='Spendwell'/>
          </Link>
        :
          <div className='brand mui--appbar-height mui--appbar-line-height'>
            <img src={logoIconWhite} alt='Spendwell'/>
          </div>
        }

        {!plain ? <OnboardProgress viewer={viewer}/> : null}
      </nav>
    );
  }
}

Header = Relay.createContainer(Header, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${OnboardProgress.getFragment('viewer')}

        safeToSpend
      }
    `,
  },
});

export default Header;
