
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { listBuckets } from 'state/buckets';
import Card from 'components/card';
import CardList from 'components/card-list';
import styles from 'sass/views/dashboard.scss';


class Dashboard extends Component {
  static propTypes = {
    buckets: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { selectedBucket: null };
  }

  componentDidMount() {
    this.props.dispatch(listBuckets());
  }

  render() {
    return (
      <div className={`container ${styles.root}`}>
        <div className='heading'>
          <h1>Buckets</h1>
          <div>
            <Link className='btn btn-primary' to='/buckets/new'>
              <i className='fa fa-plus'/>
              {' New Bucket'}
            </Link>
          </div>
        </div>

        <CardList>
          {this.props.buckets.map((bucket)=> (
            <Card
              key={bucket.id}
              onClick={()=> this.setState({ selectedBucket: bucket })}
              expanded={this.state.selectedBucket === bucket}
            >
              {bucket.name}
              {this.state.selectedBucket === bucket ? (
                <div><Link to={`/buckets/${bucket.id}`}>View</Link></div>
              ) : null}
            </Card>
          ))}
        </CardList>
      </div>
    );
  }
}

export default connect((state)=> ({
  buckets: state.buckets.list,
}))(Dashboard);
