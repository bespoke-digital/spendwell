
import { Link } from 'react-router';

import style from 'sass/components/nav';


export default function(props) {
  return (
    <div className={`${style.root} ${props.open ? 'open' : ''}`}>
      <div className='mui--appbar-height'/>
      <div className='mui-divider'></div>
      <ul>
        <li><Link to='/dashboard'>Dashboard</Link></li>
        <li><Link to='/accounts'>Accounts</Link></li>
        <li><Link to='/logout'>Logout</Link></li>
      </ul>
    </div>
  );
}
