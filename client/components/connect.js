
import _ from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';

import { connectPlaid } from 'state/auth';
import styles from 'sass/components/connect.scss';


class Connect extends Component {
  constructor() {
    super();
    this.state = { results: [] };
    this.handleSearch = _.debounce(this.handleSearch.bind(this), 300);
  }

  handleSearch(event) {
    // this.context.socket.emit(
    //   'plaid.institutions.search',
    //   { query: event.target.value },
    //   (data)=> this.setState({ results: data.results }),
    // );
  }

  selectFi(fi) {
    window.Plaid.create({
      clientName: 'Moneybase',
      key: '4b747132cf8c427bec79f00e0dcb4a',
      product: 'connect',
      longTail: true,
      env: 'tartan',
      onSuccess: (publicToken)=> {
        console.log('onSuccess', publicToken);
        this.props.dispatch(connectPlaid({ publicToken }));
      },
    }).open(fi.id);
  }

  render() {
    console.log('results', this.state.results);
    return (
      <div className='container'>
        <h1>Connect Account</h1>

        <form onSubmit={(e)=> e.preventDefault()}>
          <div className='form-group'>
            <label>Search</label>
            <input type='text' className='form-control' onChange={this.handleSearch}/>
          </div>
        </form>

        <ul className='list-unstyled'>
          {this.state.results.map((fi)=> (
            <li className={styles.fi} onClick={this.selectFi.bind(this, fi)} key={fi.id}>
              <div className='panel panel-default'>
                <div className='panel-body' style={{ backgroundColor: fi.colors.darker }}>

                  {fi.logo ? <img src={`data:image/png;base64,${fi.logo}`} alt={fi.name}/> : null}

                  <div className='fi-name'>
                    <strong>{fi.nameBreak ? fi.name.slice(0, fi.nameBreak) : fi.name}</strong><br/>
                    {fi.nameBreak ? fi.name.slice(fi.nameBreak) : null}
                  </div>

                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default connect((state)=> ({ auth: state.auth }))(Connect);
