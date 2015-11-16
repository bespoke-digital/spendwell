
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import styles from 'sass/components/home.scss';


class Home extends Component {
  constructor() {
    super();
    this.state = { transactions: [], accounts: [] };
  }

  componentDidMount() {
    this.context.socket.emit('plaid.transactions', (response)=> {
      if (response.success)
        this.setState({
          transactions: response.transactions,
          accounts: response.accounts,
        });
      else
        console.error('network error:', response);
    });
  }

  render() {
    console.log(this.state);
    return (
      <div className={`container ${styles.root}`}>
        <h1>Home</h1>
        {this.props.auth.authenticated && this.props.auth.user.isConnected ? (
          <ul>
            {this.state.accounts.map((account, index)=> (
              <li key={index}>
                {`${account.meta.name} (${account.meta.number})`}
              </li>
            ))}
          </ul>
        ) : this.props.auth.authenticated ? (
          <span>Please <Link to='/connect'>connect</Link> your account.</span>
        ) : (
          <span>Please <Link to='/signup'>sign up</Link>.</span>
        )}
      </div>
    );
  }
}

Home.propTypes = {
  auth: PropTypes.object.isRequired,
};

Home.contextTypes = {
  socket: PropTypes.object,
};

export default connect((state)=> ({ auth: state.auth }))(Home);
