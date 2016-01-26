
import { Component } from 'react';
import { Link } from 'react-router';
import reactMixin from 'react-mixin';

import Card from 'components/card';
import CardList from 'components/card-list';
import Button from 'components/button';

import Buckets from 'collections/buckets';

import styles from 'sass/views/buckets.scss';


@reactMixin.decorate(ReactMeteorData)
export default class BucketsView extends Component {
  constructor() {
    super();
    this.state = { selectedBucket: null };
  }

  getMeteorData() {
    return {
      buckets: Buckets.find({}).fetch(),
    };
  }

  render() {
    const { buckets } = this.data;
    const { selectedBucket } = this.state;

    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <h1>Buckets</h1>
          <div>
            <Button to='/buckets/new' raised={true}>
              <i className='fa fa-plus'/>
              {' New Bucket'}
            </Button>
          </div>
        </div>

        <CardList>
          {buckets.map((bucket)=> (
            <Card
              key={bucket._id}
              onClick={()=> this.setState({ selectedBucket: bucket._id })}
              expanded={selectedBucket === bucket._id}
            >
              {bucket.name}
              {selectedBucket === bucket._id ? (
                <div><Link to={`/buckets/${bucket._id}`}>View</Link></div>
              ) : null}
            </Card>
          ))}
        </CardList>
      </div>
    );
  }
}
