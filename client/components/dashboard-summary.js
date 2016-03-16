
import { Component } from 'react';
import Relay from 'react-relay';

import Card from 'components/card';
import SuperCard from 'components/super-card';
import CardList from 'components/card-list';
import Button from 'components/button';
import Money from 'components/money';
import Transition from 'components/transition';
import IncomingSummary from 'components/incoming-summary';
import OutgoingSummary from 'components/outgoing-summary';

import styles from 'sass/views/dashboard-summary.scss';


class DashboardSummary extends Component {
  constructor() {
    super();
    this.state = {
      statusOpen: null,
      showInFromSavings: false,
    };
  }

  handleStatusClick(type) {
    const { statusOpen } = this.state;
    if (statusOpen === type)
      this.setState({ statusOpen: null });
    else
      this.setState({ statusOpen: type });
  }

  render() {
    const { summary, viewer, periods } = this.props;
    const { statusOpen } = this.state;

    const {
      income,
      incomeEstimated,
      goalsTotal,
      billsUnpaidTotal,
      spent,
      net,
    } = summary;

    const allocated = goalsTotal + billsUnpaidTotal + spent;

    return (
      <CardList className={styles.root}>
        <Card className='month'>
          <Button
            to={`/app/dashboard/${periods.previous.format('YYYY/MM')}`}
            disabled={periods.previous.isSame(periods.first)}
          >
            <i className='fa fa-chevron-left'/>
          </Button>

          <div className='current'>{periods.current.format('MMMM YYYY')}</div>

          <Button
            to={`/app/dashboard/${periods.next.format('YYYY/MM')}`}
            disabled={periods.next.isAfter(periods.now)}
          >
            <i className='fa fa-chevron-right'/>
          </Button>
        </Card>

        <Card className={`status ${statusOpen ? 'open' : ''}`}>
          <a
            className={`number ${statusOpen === 'in' ? 'open' : ''}`}
            onClick={this.handleStatusClick.bind(this, 'in')}
            href='#'
          >
            <div className='title'>In</div>
            <div className='amount'>
              <Money amount={income}/>
              <span className='asterisk'>{incomeEstimated ? '*' : ''}</span>
            </div>
          </a>
          <a
            className={`number ${statusOpen === 'out' ? 'open' : ''}`}
            onClick={this.handleStatusClick.bind(this, 'out')}
            href='#'
          >
            <div className='title'>Out</div>
            <div className='amount'>
              <Money amount={allocated} abs={true}/>
              <span className='asterisk'>{billsUnpaidTotal !== 0 ? '*' : ''}</span>
            </div>
          </a>
          <a
            className={`number ${statusOpen === 'net' ? 'open' : ''}`}
            onClick={this.handleStatusClick.bind(this, 'net')}
            href='#'
          >
            <div className='title'>Net</div>
            <div className='amount'><Money amount={net}/></div>
          </a>
        </Card>

        <Transition name='fade' show={statusOpen === 'in'}>
          <IncomingSummary summary={summary} viewer={viewer}/>
        </Transition>

        <Transition name='fade' show={statusOpen === 'out'}>
          <OutgoingSummary summary={summary}/>
        </Transition>

        <Transition name='fade' show={statusOpen === 'net'}>
          <SuperCard className='status-details' expanded={true} summary={
            <Card></Card>
          }>
            <Card summary={
              <div>
                <div>In</div>
                <div><Money amount={income}/></div>
              </div>
            }/>
            <Card summary={
              <div>
                <div>Out</div>
                <div><Money amount={allocated}/></div>
              </div>
            }/>
            <Card summary={
              <div>
                <div><strong>Total</strong></div>
                <div><strong><Money amount={income + allocated}/></strong></div>
              </div>
            }/>
          </SuperCard>
        </Transition>
      </CardList>
    );
  }
}

DashboardSummary = Relay.createContainer(DashboardSummary, {
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        ${IncomingSummary.getFragment('viewer')}
      }
    `,
    summary: ()=> Relay.QL`
      fragment on Summary {
        ${IncomingSummary.getFragment('summary')}
        ${OutgoingSummary.getFragment('summary')}

        income
        incomeEstimated
        goalsTotal
        billsUnpaidTotal
        spent
        net
      }
    `,
  },
});

export default DashboardSummary;
