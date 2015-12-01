
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getList } from 'state/buckets';
import styles from 'sass/components/home.scss';


class Dashboard extends Component {
  static propTypes = {
    buckets: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { category: null };
  }

  componentDidMount() {
    this.props.dispatch(getList());
  }

  render() {
    console.log(this.props.buckets);
    return (
      <div className={`container ${styles.root}`}>
        <strong>Dashboard</strong>
        <table className='table'>
          <tbody>
            {this.props.buckets.map((bucket)=> (
              <tr key={bucket.id}>
                <td>{bucket.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect((state)=> ({
  buckets: state.buckets.list,
}))(Dashboard);
