
import { Component } from 'react';
import { browserHistory } from 'react-router';
import Relay from 'react-relay';
import moment from 'moment';

import CardList from 'components/card-list';
import Card from 'components/card';
import Button from 'components/button';
import TransactionList from 'components/transaction-list';

import { GenerateBucketMonthMutation } from 'mutations/buckets';

import styles from 'sass/views/bucket.scss';


class Bucket extends Component {
  generateBucketMonth() {
    const { viewer: { bucket } } = this.props;

    const lastMonth = bucket.months.edges[bucket.months.edges.length - 1].node;
    const month = moment(lastMonth.monthStart).subtract('1 month');

    console.log('GenerateBucketMonthMutation', { bucket, month });

    Relay.Store.commitUpdate(new GenerateBucketMonthMutation({ bucket, month }), {
      onSuccess: ()=> console.log('GenerateBucketMonthMutation Success'),
      onFailure: ()=> console.log('GenerateBucketMonthMutation Failure'),
    });
  }

  render() {
    const { viewer: { bucket } } = this.props;

    if (!bucket)
      return this.render404();

    return (
      <div className={`container ${styles.root}`}>

        <div className='heading'>
          <Button onClick={()=> browserHistory.goBack()} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>

          <h1>{bucket.name}</h1>
        </div>

        {bucket.months.edges.map(({ node })=>
          <CardList key={node.id}>
            <Card className='card-list-headings'>
              {moment(node.monthStart).format('MMMM YYYY')}
            </Card>
            <TransactionList transactions={node.transactions} monthHeaders={false}/>
          </CardList>
        )}

        <Button onClick={::this.generateBucketMonth}>
          <i className='fa fa-plus'/>
          {' Next Month'}
        </Button>
      </div>
    );
  }

  render404() {
    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <Button onClick={()=> browserHistory.goBack()} className='back'>
            <i className='fa fa-long-arrow-left'/>
          </Button>
          <h1>Bucket Not Found</h1>
        </div>
      </div>
    );
  }
}

Bucket = Relay.createContainer(Bucket, {
  initialVariables: { id: null },
  fragments: {
    viewer: ()=> Relay.QL`
      fragment on Viewer {
        bucket(id: $id) {
          ${GenerateBucketMonthMutation.getFragment('bucket')}
          name
          months(first: 100) {
            edges {
              node {
                id
                monthStart
                transactions(first: 1000) {
                  ${TransactionList.getFragment('transactions')}
                }
              }
            }
          }
        }
      }
    `,
  },
});

export default Bucket;
