
import { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import moment from 'moment';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';
import GoalMonth from 'components/goal-month';
import BucketMonth from 'components/bucket-month';
import BillMonth from 'components/bill-month';
import SpentFromSavings from 'components/spent-from-savings';
import TransactionList from 'components/transaction-list';
import ScrollTrigger from 'components/scroll-trigger';
import App from 'components/app';
import DashboardSummary from 'components/dashboard-summary';

import { AssignTransactionsMutation } from 'mutations/buckets';

import styles from 'sass/views/dashboard.scss';


class Dashboard extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = { selected: null };
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

  loadTransactions() {
    const { relay } = this.props;
    const { transactionCount } = relay.variables;

    relay.setVariables({ transactionCount: transactionCount + 20 });
  }

  render() {
    if (!this.props.viewer.summary) {
      console.log('fuck this shit', this.props);
      return <div className='container'>No Summary</div>;
    }

    const { params: { year, month }, viewer } = this.props;
    const {
      spent,
      spentFromSavings,
      goalMonths,
      bucketMonths,
      billMonths,
      expenseTransactions,
    } = viewer.summary;

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
      <App viewer={viewer}>
        <ScrollTrigger
          className={`container ${styles.root}`}
          onTrigger={::this.loadTransactions}
        >
          <DashboardSummary summary={viewer.summary} periods={periods}/>

          <div className='heading'>
            <h2>Goals <small>for long and short term savings</small></h2>
            <div>
              <Button to='/app/goals/new' flat={true} variant='primary'>
                {' New Goal'}
              </Button>
            </div>
          </div>

          {goalMonths.edges.length > 0 ?
            <CardList>
              <Card className='card-list-headings'>
                <div></div>
                <div className='amount'>Target</div>
                <div className='amount'>Funded</div>
              </Card>

              {goalMonths.edges.map(({ node })=>
                <GoalMonth
                  key={node.id}
                  goalMonth={node}
                  selected={selected === node.id}
                  onClick={this.select.bind(this, node.id)}
                />
              )}
            </CardList>
          : null}

          {spentFromSavings > 0 ?
            <CardList>
              <SpentFromSavings
                summary={viewer.summary}
                month={periods.current}
                selected={selected === 'spentFromSavings'}
                onClick={this.select.bind(this, 'spentFromSavings')}
              />
            </CardList>
          : null}

          <div className='heading'>
            <h2>Bills <small>for monthly recurring expenses</small></h2>
            <div>
              <Button to='/app/bills/new' flat={true} variant='primary'>
                {' New Bill'}
              </Button>
            </div>
          </div>

          {billMonths.edges.length > 0 ?
            <CardList>
              <Card className='card-list-headings'>
                <div></div>
                <div className='amount'>Average</div>
                <div className='amount'>Spent</div>
              </Card>
              {billMonths.edges.map(({ node })=>
                <BillMonth
                  key={node.id}
                  bucketMonth={node}
                  month={periods.current}
                  expanded={selected === node.id}
                  onClick={this.select.bind(this, node.id)}
                />
              )}
            </CardList>
          : null}

          <div className='heading'>
            <h2>Labels <small>for all non-recurring expenses</small></h2>
            <div>
              <Button to='/app/buckets/new' flat={true} variant='primary'>
                {' New label'}
              </Button>
            </div>
          </div>

          {bucketMonths.edges.length > 0 ?
            <CardList>
              <Card className='card-list-headings'>
                <div></div>
                <div className='amount'>Average</div>
                <div className='amount'>Spent</div>
              </Card>
              {bucketMonths.edges.map(({ node })=>
                <BucketMonth
                  key={node.id}
                  bucketMonth={node}
                  month={periods.current}
                  expanded={selected === node.id}
                  onClick={this.select.bind(this, node.id)}
                />
              )}
            </CardList>
          : null}

          <div className='heading'>
            <h2>All Expenses</h2>
          </div>

          <CardList>
            {spent !== 0 ?
              <Card className='card-list-headings'>
                <div>Total</div>
                <div className='amount'>
                  <Money amount={spent} abs/>
                </div>
              </Card>
            : null}

            <TransactionList transactions={expenseTransactions} monthHeaders={false}/>

            {expenseTransactions && expenseTransactions.pageInfo.hasNextPage ?
              <div className='bottom-load-button'>
                <Button onClick={::this.loadTransactions} raised>Load More</Button>
              </div>
            : null}
          </CardList>
        </ScrollTrigger>
      </App>
    );
  }
}

const now = moment();

Dashboard = Relay.createContainer(Dashboard, {
  initialVariables: {
    month: now.format('MM'),
    year: now.format('YYYY'),
    transactionCount: 20,
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
        ${App.getFragment('viewer')}
        ${AssignTransactionsMutation.getFragment('viewer')}

        summary(month: $date) {
          ${SpentFromSavings.getFragment('summary')}
          ${DashboardSummary.getFragment('summary')}

          spent
          spentFromSavings
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
              }
            }
          }
          billMonths(first: 1000) {
            edges {
              node {
                ${BillMonth.getFragment('bucketMonth')}
                id
              }
            }
          }
          incomeTransactions: transactions(first: 100, amountGt: 0) {
            ${TransactionList.getFragment('transactions')}
          }
          expenseTransactions: transactions(first: $transactionCount, amountLt: 0) {
            ${TransactionList.getFragment('transactions')}
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    `,
  },
});

export default Dashboard;
