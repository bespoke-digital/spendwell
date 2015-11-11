
import path from 'path';
import http from 'http';

// import favicon from 'serve-favicon';
import Express from 'express';
import logger from 'morgan';
import compression from 'compression';
import staticServe from 'serve-static';
import socketIO from 'socket.io';

import plaid from './api/plaid';
import auth from './api/auth/socket';


const app = new Express();
const server = new http.Server(app);
const io = socketIO(server);

app.use(logger('dev'));
app.use(compression());
app.use(staticServe(path.join(__dirname, '..', 'public')));
// app.use(favicon(path.join(__dirname, '../public/img/favicons/favicon.ico')));

io.on('connection', function(socket) {
  plaid(socket);
  auth(socket);
});

server.listen('8000', (err)=> {
  if (err) console.error(err);
  console.info('==>  https://localhost:8000');
});
