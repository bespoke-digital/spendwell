
import { Component, PropTypes } from 'react';
import { Form } from 'formsy-react';
import reactMixin from 'react-mixin';

import Button from 'components/button';
import Card from 'components/card';
import Input from 'components/forms/input';

import Goals from 'collections/goals';

import styles from 'sass/views/create-bucket.scss';


@reactMixin.decorate(ReactMeteorData)
export default class Goal extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { valid: false };
  }

  getMeteorData() {
    const { params } = this.props;

    if (!params.id)
      return {};

    return {
      goal: Goals.findOne(params.id),
    };
  }

  handleSubmit({ name, amount }) {
    const { history } = this.props;
    const { goal } = this.data;

    amount = parseInt(amount * 100);

    const args = [];

    if (goal) {
      args.push('goalsUpdate');
      args.push(goal._id);
    } else {
      args.push('goalsCreate');
    }

    args.push({ name, amount });

    Meteor.call(...args, (error)=> {
      if (error) throw error;
      history.goBack();
    });
  }

  render() {
    const { valid } = this.state;
    const { goal } = this.data;

    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <Button onClick={()=> this.props.history.goBack()} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>{goal ? 'Edit Goal' : 'New Savings Goal'}</h1>
        </div>

        <Card>
          <Form
            onValidSubmit={::this.handleSubmit}
            onValid={this.setState.bind(this, { valid: true })}
            onInvalid={this.setState.bind(this, { valid: false })}
          >
            <Input
              label='Name'
              name='name'
              value={goal ? goal.name : null}
              required
            />
            <Input
              label='Amount'
              name='amount'
              value={goal ? (goal.amount / 100).toFixed(2) : null}
              required
              validations='isNumeric'
            />

            <Button type='submit' variant='primary' disabled={!valid}>
              {goal ? 'Save' : 'Create'}
            </Button>

            <Button onClick={()=> this.props.history.goBack()}>
              Cancel
            </Button>
          </Form>
        </Card>

      </div>
    );
  }
}
