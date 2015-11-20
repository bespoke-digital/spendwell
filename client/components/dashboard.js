
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { load as loadCategories } from 'state/categories';
import styles from 'sass/components/home.scss';


class Dashboard extends Component {
  static propTypes = {
    categories: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = { category: null };
  }

  componentDidMount() {
    this.props.dispatch(loadCategories({ parent: 'none' }));
  }

  render() {
    console.log(this.props.categories);
    return (
      <div className={`container ${styles.root}`}>
        <strong>Dashboard</strong>
        <table className='table'>
          <tbody>
            {this.props.categories.map((category)=> (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect((state)=> ({
  categories: state.categories,
}))(Dashboard);
