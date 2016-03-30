
import { Component } from 'react';
import Relay from 'react-relay';
import Row from 'muicss/lib/react/row';
import Col from 'muicss/lib/react/col';

import ConnectAccount from 'components/connect-account';
import Onboarding from 'components/onboarding';
import Card from 'components/card';
import CardList from 'components/card-list';

import bankImage from 'img/views/onboarding/bank.svg';
import securityImage from 'img/views/onboarding/security.svg';
import anonymityImage from 'img/views/onboarding/anonymity.svg';
import privacyImage from 'img/views/onboarding/privacy.svg';

import connectStyles from 'sass/views/add-plaid.scss';
import style from 'sass/views/onboarding/add-account.scss';


class AddAccountView extends Component {
  render() {
    const { viewer } = this.props;

    return (
      <Onboarding viewer={viewer}>
        <div className={`container skinny ${style.root}`}>
          <CardList>
            <Card className='help'>
              <img src={bankImage}/>
              <h3>Welcome To Spendwell</h3>
              <p>
                Get started by connecting your bank accounts. It's important that
                you connect all accounts where money comes in or is spent.
              </p>
              <div className='clearfix'/>
            </Card>
          </CardList>
          <Row>
            <Col md='8' lg='9' className={`connect ${connectStyles.root}`}>

              <h1>Connect Accounts</h1>

              <ConnectAccount viewer={viewer}/>
            </Col>
            <Col md='4' lg='3' className='welcome'>
              <div>
                <div>
                  <img src={securityImage}/>
                  <h3>Bank Level Security</h3>
                </div>

                <div>
                  <img src={anonymityImage}/>
                  <h3>Anonymity</h3>
                </div>

                <div>
                  <img src={privacyImage}/>
                  <h3>Data Privacy</h3>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Onboarding>
    );
  }
}


AddAccountView = Relay.createContainer(AddAccountView, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${Onboarding.getFragment('viewer')}
        ${ConnectAccount.getFragment('viewer')}
      }
    `,
  },
});

export default AddAccountView;
