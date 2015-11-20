
import _ from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';

import { connect as connectInstitution } from 'state/institutions';
import styles from 'sass/components/connect.scss';

class Connect extends Component {
  constructor() {
    super();
    this.state = { results: [] };
    this.handleSearch = _.debounce(this.handleSearch.bind(this), 300);
  }

  componentDidMount() {
    if (!window.Plaid) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.plaid.com/link/stable/link-initialize.js';
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

  handleSearch(event) {
    fetch(`https://tartan.plaid.com/institutions/search?p=connect&q=${event.target.value}`)
      .then((response)=> response.json())
      .then((results)=> this.setState({ results }));
  }

  selectFi(fi) {
    window.Plaid.create({
      clientName: 'Moneybase',
      key: '4b747132cf8c427bec79f00e0dcb4a',
      product: 'connect',
      longTail: true,
      env: 'tartan',
      onSuccess: (publicToken)=> {
        console.log({ id: fi.id, publicToken });
        this.props.dispatch(connectInstitution({ id: fi.id, publicToken }));
      },
    }).open(fi.id);
  }

  render() {
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

export default connect((state)=> ({ institutions: state.institutions }))(Connect);
