
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import moment from 'moment';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';
import GoalMonth from 'components/goal-month';

import styles from 'sass/views/dashboard.scss';
import Bucket from './bucket';


class Dashboard extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {};
  }

  render() {
    if (!this.props.viewer.summary) {
      console.log('fuck this shit', this.props);
      return <div className='container'>No Summary</div>;
    }

    const {
      params: { year, month },
      viewer: {
        summary: {
          income,
          allocated,
          spent,
          net,
          goalMonths,
        },
      },
    } = this.props;
    const { selected } = this.state;

    const now = moment().startOf('month');
    const current = year && month ? moment(`${year}-${month}-0`) : now;
    const periods = {
      now,
      current,
      previous: current.clone().subtract(1, 'month'),
      next: current.clone().add(1, 'month'),
    };

    const buckets = [];

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
            In
            <div className='amount'><Money amount={income}/></div>
          </Link>
          <Link to='/app/outgoing'>
            Out
            <div className='amount'><Money amount={spent + allocated} abs={true}/></div>
          </Link>
          <div>
            Net
            <div className='amount'><Money amount={net}/></div>
          </div>
        </Card>

        <div className='heading'>
          <h2>Goals</h2>
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
          {goalMonths ? goalMonths.edges.map(({ node })=>
            <GoalMonth
              key={node.id}
              goalMonth={node}
              month={periods.current}
              selected={selected === node.id}
              onClick={()=> this.setState({ selected: node.id })}
            >
              <Button
                onClick={()=> this.setState({ selected: null })}
                propagateClick={false}
              >Close</Button>
              <Button to={`/app/goals/${node.id}`}>Edit</Button>
            </GoalMonth>
          ) : null}
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
          {spent !== 0 ?
            <Card>
              <div className='summary'>
                <div>Other</div>
                <div className='amount'>
                  <Money amount={spent} abs/>
                </div>
              </div>
            </Card>
          : null}
        </CardList>
      </div>
    );
  }
}

const now = moment();

Dashboard = Relay.createContainer(Dashboard, {
  initialVariables: {
    month: now.format('MM'),
    year: now.format('YYYY'),
  },
  prepareVariables: (variables)=> {
    if (variables.year && variables.month)
      return { ...variables, date: `${variables.year}/${variables.month}` };
    else
      return variables;
  },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        summary(month: $date) {
          income
          allocated
          spent
          net
          goalMonths(first: 1000) {
            edges {
              node {
                id
                ${GoalMonth.getFragment('goalMonth')}
              }
            }
          }
        }
      }
    `,
  },
});

export default Dashboard;
