
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import moment from 'moment';
import relayContainer from 'relay-decorator';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';

import styles from 'sass/views/dashboard.scss';
import Bucket from './bucket';
import Goal from './goal';


@relayContainer({
  prepareVariables: (variables)=> ({
    month: variables.year ? `${variables.year}/${variables.month}` : moment().format('YYYY/MM'),
  }),
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        safeToSpend
        income(month: $month)
      }
    `,
  },
})
export default class Dashboard extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {};
  }

  render() {
    console.log('Dashboard', this.props);

    const { viewer: { safeToSpend, income }, params: { year, month } } = this.props;
    const { selected } = this.state;

    const now = moment().startOf('month');
    const current = year ? moment(`${year}-${month}-0`) : now;
    const periods = {
      now,
      current,
      previous: current.clone().subtract(1, 'month'),
      next: current.clone().add(1, 'month'),
    };

    const goals = [];
    const buckets = [];
    const unbucketedAmount = 0;

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
            <div className='amount'><Money amount={income}/></div>
          </Link>
          <div>
            Safe To Spend
            <div className='amount'><Money amount={safeToSpend}/></div>
          </div>
        </Card>

        <div className='heading'>
          <h2>Saved</h2>
          <div>
            <Button to='/app/goals/new' raised>
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
            <Button to='/app/outgoing' raised>
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
                  <Money amount={unbucketedAmount} abs/>
                </div>
              </div>
            </Card>
          : null}
        </CardList>
      </div>
    );
  }
}
