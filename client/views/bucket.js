
import _ from 'lodash';
import { Component } from 'react';
import { browserHistory } from 'react-router';
import Relay from 'react-relay';
import moment from 'moment';

import CardList from 'components/card-list';
import Card from 'components/card';
import Button from 'components/button';
import TransactionList from 'components/transaction-list';
import App from 'components/app';
import BucketForm from 'components/bucket-form';

import {
  GenerateBucketMonthMutation,
  DeleteBucketMutation,
  UpdateBucketMutation,
} from 'mutations/buckets';

import styles from 'sass/views/bucket.scss';


class Bucket extends Component {
  constructor() {
    super();
    this.state = { showSettings: false };
  }

  generateBucketMonth() {
    const { viewer: { bucket } } = this.props;

    const lastMonth = bucket.months.edges[bucket.months.edges.length - 1].node;
    const month = moment(lastMonth.monthStart).subtract('1 month');

    console.log('GenerateBucketMonthMutation', { bucket, month });

    Relay.Store.commitUpdate(new GenerateBucketMonthMutation({ bucket, month }), {
      onSuccess: ()=> console.log('Success: GenerateBucketMonthMutation'),
      onFailure: ()=> console.log('Failure: GenerateBucketMonthMutation'),
    });
  }

  deleteBucket() {
    const { viewer } = this.props;
    const { bucket } = viewer;

    console.log('DeleteBucketMutation', { viewer, bucket });
    Relay.Store.commitUpdate(new DeleteBucketMutation({ viewer, bucket }), {
      onFailure: ()=> console.log('Failure: DeleteBucketMutation'),
      onSuccess: ()=> {
        console.log('Success: DeleteBucketMutation');
        browserHistory.push('/app/dashboard');
      },
    });
  }

  updateBucket(data) {
    const { viewer } = this.props;

    const args = {
      viewer,
      bucket: viewer.bucket,
      name: data.name,
      filters: data.filters,
    };

    console.log('UpdateBucketMutation', args);
    Relay.Store.commitUpdate(new UpdateBucketMutation(args), {
      onFailure: ()=> console.log('Failure: UpdateBucketMutation'),
      onSuccess: ()=> console.log('Success: UpdateBucketMutation'),
    });
  }

  toggleSettings() {
    const { showSettings } = this.state;
    this.setState({ showSettings: !showSettings });
  }

  render() {
    const { viewer } = this.props;
    const { showSettings } = this.state;

    if (!viewer.bucket)
      return this.render404();

    return (
      <App viewer={viewer} back={true}>
        <div className={`container ${styles.root}`}>

          <div className='heading'>
            <h1>{viewer.bucket.name}</h1>

            <Button onClick={::this.toggleSettings} flat>
              <i className='fa fa-cog'/>
            </Button>
            <Button onClick={::this.deleteBucket} flat variant='danger'>
              <i className='fa fa-times'/>
            </Button>
          </div>

          {showSettings ?
            <BucketForm
              viewer={viewer}
              bucket={viewer.bucket}
              onSubmit={::this.updateBucket}
              onCancel={::this.toggleSettings}
            />
          : null}

          {viewer.bucket.months.edges.map(({ node })=>
            <CardList key={node.id}>
              <Card className='card-list-headings'>
                {moment(node.monthStart).asUtc().format('MMMM YYYY')}
              </Card>
              <TransactionList transactions={node.transactions} monthHeaders={false}/>
            </CardList>
          )}

          <div className='bottom-load-button'>
            <Button onClick={::this.generateBucketMonth} flat>
              <i className='fa fa-plus'/>{' Add Month'}
            </Button>
          </div>
        </div>
      </App>
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
        ${App.getFragment('viewer')}
        ${BucketForm.getFragment('viewer')}
        ${DeleteBucketMutation.getFragment('viewer')}
        ${UpdateBucketMutation.getFragment('viewer')}

        bucket(id: $id) {
          ${GenerateBucketMonthMutation.getFragment('bucket')}
          ${DeleteBucketMutation.getFragment('bucket')}
          ${UpdateBucketMutation.getFragment('bucket')}
          ${BucketForm.getFragment('bucket')}

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
