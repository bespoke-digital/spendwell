
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import moment from 'moment';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';
import GoalMonth from 'components/goal-month';
import BucketMonth from 'components/bucket-month';
import SpentFromSavings from 'components/spent-from-savings';

import { AssignTransactionsMutation } from 'mutations/buckets';

import styles from 'sass/views/dashboard.scss';


class Dashboard extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {};
  }

  syncBuckets(month) {
    const { viewer } = this.props;
    Relay.Store.commitUpdate(new AssignTransactionsMutation({ viewer, month }), {
      onSuccess: ()=> console.log('AssignTransactionsMutation Success'),
      onFailure: ()=> console.log('AssignTransactionsMutation Failure'),
    });
  }

  select(id) {
    const { selected } = this.state;

    if (selected === id)
      this.setState({ selected: null });
    else
      this.setState({ selected: id });
  }

  render() {
    if (!this.props.viewer.summary) {
      console.log('fuck this shit', this.props);
      return <div className='container'>No Summary</div>;
    }

    const { params: { year, month }, viewer: { summary } } = this.props;
    const {
      income,
      allocated,
      spent,
      net,
      goalMonths,
      bucketMonths,
    } = summary;

    const { selected } = this.state;

    const now = moment().startOf('month');
    const current = year && month ? moment(`${year}-${month}-0`) : now;
    const periods = {
      now,
      current,
      previous: current.clone().subtract(1, 'month'),
      next: current.clone().add(1, 'month'),
    };

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
          <div>
            In
            <div className='amount'><Money amount={income}/></div>
          </div>
          <div>
            Out
            <div className='amount'><Money amount={spent + allocated} abs={true}/></div>
          </div>
          <div>
            Net
            <div className='amount'><Money amount={net}/></div>
          </div>
        </Card>

        <div className='heading'>
          <h2>Obligations</h2>
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
          {goalMonths.edges.map(({ node })=>
            <GoalMonth
              key={node.id}
              goalMonth={node}
              month={periods.current}
              selected={selected === node.id}
              onClick={this.select.bind(this, node.id)}
            >
              <Button to={`/app/goals/${node.id}`}>Edit</Button>
            </GoalMonth>
          )}
        </CardList>

        <CardList>
          <SpentFromSavings
            summary={summary}
            month={periods.current}
            selected={selected === 'spentFromSavings'}
            onClick={this.select.bind(this, 'spentFromSavings')}
          />
        </CardList>

        <div className='heading'>
          <h2>Expenses</h2>
          <div>
            <Button raised onClick={this.syncBuckets.bind(this, periods.current)}>
              <i className='fa fa-refresh'/>
            </Button>
            <Button to='/app/buckets/new' raised>
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
          {bucketMonths.edges.map(({ node })=>
            <BucketMonth
              key={node.id}
              bucketMonth={node}
              month={periods.current}
              selected={selected === node.id}
              onClick={this.select.bind(this, node.id)}
            >
              <Button to={`/app/buckets/${node.bucket.id}`}>Edit</Button>
            </BucketMonth>
          )}
          {spent !== 0 ?
            <Card>
              <div className='summary'>
                <div>All Expenses</div>
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
        ${AssignTransactionsMutation.getFragment('viewer')}
        summary(month: $date) {
          ${SpentFromSavings.getFragment('summary')}
          income
          allocated
          spent
          net
          goalMonths(first: 1000) {
            edges {
              node {
                ${GoalMonth.getFragment('goalMonth')}
                id
              }
            }
          }
          bucketMonths(first: 1000) {
            edges {
              node {
                ${BucketMonth.getFragment('bucketMonth')}
                id
                bucket {
                  id
                }
              }
            }
          }
        }
      }
    `,
  },
});

export default Dashboard;
