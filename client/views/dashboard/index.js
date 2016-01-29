
import { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';
import { Link } from 'react-router';
import moment from 'moment';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';

import Buckets from 'collections/buckets';
import Transactions from 'collections/transactions';
import Goals from 'collections/goals';

import styles from 'sass/views/dashboard.scss';
import Bucket from './bucket';
import Goal from './goal';


@reactMixin.decorate(ReactMeteorData)
export default class Dashboard extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {};
  }

  periods() {
    const { year, month } = this.props.params;

    const now = moment().startOf('month');
    const current = year ? moment(`${year}-${month}-0`) : now;
    return {
      now,
      current,
      previous: current.clone().subtract(1, 'month'),
      next: current.clone().add(1, 'month'),
    };
  }

  getMeteorData() {
    const periods = this.periods();

    return {
      transactions: Transactions.find({
        transfer: false,
        date: {
          $gte: periods.current.toDate(),
          $lt: periods.current.clone().add(1, 'month').toDate(),
        },
      }).fetch(),
      goals: Goals.find().fetch(),
      buckets: Buckets.find({ type: 'outgoing' }).fetch(),
    };
  }

  render() {
    const { transactions, buckets, goals } = this.data;
    const { selected } = this.state;
    const periods = this.periods();

    const incomingAmount = Transactions.sum(transactions.filter((t)=> t.amount > 0));
    const spentAmount = Transactions.sum(transactions.filter((t)=> t.amount < 0));

    goals.reduce((remaining, goal)=> {
      if (remaining <= 0) {
        goal.filled = 0;
        return 0;
      }

      const diff = remaining - goal.amount;

      if (diff >= 0) {
        goal.filled = goal.amount;

        return diff;

      } else {
        goal.filled = goal.amount + diff;

        return 0;
      }
    }, incomingAmount + spentAmount);

    const savedAmount = goals.reduce((s, g)=> s + g.filled, 0);

    const alocatedAmount = spentAmount - savedAmount;

    const bucketAmount = buckets.reduce((s, b)=> s + b.amount(periods.current), 0);
    const unbucketedAmount = spentAmount + bucketAmount;

    const safeAmount = incomingAmount + alocatedAmount;

    return (
      <div className={`container ${styles.root}`}>
        <Card className='month'>
          <Button to={`/app/dashboard/${periods.previous.format('YYYY/MM')}`}>
            <i className='fa fa-backward'/>
          </Button>

          <div className='current'>{periods.current.format('MMMM YYYY')}</div>

          <Button
            to={`/app/dashboard/${periods.next.format('YYYY/MM')}`}
            disabled={periods.next.isAfter(periods.now)}
          >
            <i className='fa fa-forward'/>
          </Button>
        </Card>

        <Card className='status'>
          <Link to='/app/incoming'>
            Income
            <div className='amount'><Money amount={incomingAmount}/></div>
          </Link>
          <Link to='/app/outgoing'>
            Alocated
            <div className='amount'><Money amount={alocatedAmount} abs={true}/></div>
          </Link>
          <div>
            Safe To Spend
            <div className='amount'><Money amount={safeAmount}/></div>
          </div>
        </Card>

        <div className='heading'>
          <h2>Saved</h2>
          <div>
            <Button to='/app/goals/new' raised={true}>
              <i className='fa fa-plus'/>
              {' New'}
            </Button>
          </div>
        </div>

        <CardList>
          <Card className='card-list-headings'>
            <div className='summary'>
              <div></div>
              <div className='amount'>Target</div>
              <div className='amount'>Saved</div>
            </div>
          </Card>
          {goals.map((goal)=>
            <Goal
              key={goal._id}
              goal={goal}
              month={periods.current}
              selected={selected === goal._id}
              onClick={()=> this.setState({ selected: goal._id })}
            >
              <Button
                onClick={()=> this.setState({ selected: null })}
                propagateClick={false}
              >Close</Button>
              <Button to={`/app/goals/${goal._id}`}>Edit</Button>
            </Goal>
          )}
        </CardList>

        <div className='heading'>
          <h2>Spent</h2>
          <div>
            <Button to='/app/outgoing' raised={true}>
              <i className='fa fa-plus'/>
              {' New'}
            </Button>
          </div>
        </div>

        <CardList>
          <Card className='card-list-headings'>
            <div className='summary'>
              <div></div>
              <div className='amount'>Average</div>
              <div className='amount'>Spent</div>
            </div>
          </Card>
          {buckets.map((bucket)=>
            <Bucket
              key={bucket._id}
              bucket={bucket}
              month={periods.current}
              selected={selected === bucket._id}
              onClick={()=> this.setState({ selected: bucket._id })}
            >
              <Button
                onClick={()=> this.setState({ selected: null })}
                propagateClick={false}
              >Close</Button>
              <Button to={`/app/buckets/${bucket._id}`}>Edit</Button>
            </Bucket>
          )}
          {unbucketedAmount !== 0 ?
            <Card>
              <div className='summary'>
                <div>Other</div>
                <div className='amount'>
                  <Money amount={unbucketedAmount} abs={true}/>
                </div>
              </div>
            </Card>
          : null}
        </CardList>
      </div>
    );
  }
}
