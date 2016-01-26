
import { Link } from 'react-router';

import style from 'sass/components/nav';


export default function({ open, toggleNav }) {
  return (
    <div className={`${style.root} ${open ? 'open' : ''}`}>
      <div className='mui--appbar-height'/>
      <div className='mui-divider'></div>
      <ul className='list-unstyled'>
        <li><Link onClick={toggleNav} to='/'>Dashboard</Link></li>
        <li><Link onClick={toggleNav} to='/accounts'>Accounts</Link></li>
        <li><Link onClick={toggleNav} to='/categories'>Categories</Link></li>
        <li><Link onClick={toggleNav} to='/logout'>Logout</Link></li>
      </ul>
    </div>
  );
}
