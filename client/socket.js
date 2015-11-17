
import io from 'socket.io-client';

import store from './store';
import { connected } from './state/connection';


const socket = io('http://localhost:8000');

socket.on('connect', ()=> store.dispatch(connected()));
socket.on('reconnect', ()=> store.dispatch(connected()));

export default socket;
