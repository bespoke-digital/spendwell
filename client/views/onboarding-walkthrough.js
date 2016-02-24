
import { Component } from 'react';

import Button from 'components/button';

import styles from 'sass/views/accounts';


class OnboardingWalkthrough extends Component {
  render() {
    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <h1>Some info probably</h1>
        </div>

        <div className='flex-row'>
          <div/>
          <Button variant='primary' href='/app/dashboard'>
            Continue
          </Button>
        </div>
      </div>
    );
  }
}

export default OnboardingWalkthrough;
