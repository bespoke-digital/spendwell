
import { Component } from 'react';
import { Form } from 'formsy-react';
import Relay from 'react-relay';
import { browserHistory } from 'react-router';

import Button from 'components/button';
import Card from 'components/card';
import Input from 'components/forms/input';
import { CreateGoalMutation } from 'mutations/goals';

import styles from 'sass/views/create-bucket.scss';


class CreateGoal extends Component {
  constructor() {
    super();
    this.state = { valid: false };
  }

  handleSubmit({ name, monthlyAmount }) {
    const { viewer } = this.props;

    monthlyAmount = parseInt(monthlyAmount * 100);

    Relay.Store.commitUpdate(new CreateGoalMutation({ viewer, name, monthlyAmount }), {
      onSuccess: ()=> {
        console.log('SUCCESS');
        browserHistory.goBack();
      },
      onFailure: console.log.bind(console, 'onFailure'),
    });
  }

  render() {
    const { valid } = this.state;

    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <Button onClick={()=> browserHistory.goBack()} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>New Goal</h1>
        </div>

        <Card>
          <Form
            onValidSubmit={::this.handleSubmit}
            onValid={this.setState.bind(this, { valid: true })}
            onInvalid={this.setState.bind(this, { valid: false })}
          >
            <Input label='Name' name='name' required/>
            <Input
              label='Monthly Amount'
              name='monthlyAmount'
              validations='isNumeric'
              required
            />

            <Button type='submit' variant='primary' disabled={!valid}>
              Create
            </Button>

            <Button onClick={()=> browserHistory.goBack()}>
              Cancel
            </Button>
          </Form>
        </Card>

      </div>
    );
  }
}

CreateGoal = Relay.createContainer(CreateGoal, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${CreateGoalMutation.getFragment('viewer')}
      }
    `,
  },
});

export default CreateGoal;
