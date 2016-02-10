
import { Link } from 'react-router';

import style from 'sass/components/nav';


export default function({ open, toggleNav }) {
  return (
    <div className={`${style.root} ${open ? 'open' : ''}`}>
      <div className='mui--appbar-height'/>
      <div className='mui-divider'></div>
      <ul className='list-unstyled'>
        <li><Link onClick={toggleNav} to='/app/'>Dashboard</Link></li>
        <li><Link onClick={toggleNav} to='/app/accounts'>Accounts</Link></li>
        <li><Link onClick={toggleNav} to='/app/transfers'>Transfers</Link></li>
        <li><Link onClick={toggleNav} to='/app/categories'>Categories</Link></li>
        <li><a href='/logout?next=/login'>Logout</a></li>
      </ul>
    </div>
  );
}
