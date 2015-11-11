
import bcrypt from 'bcrypt';
import uuid from 'uuid';

import { r } from '../thinky';
import { User } from './models';


export default function(socket) {
  socket.on('auth.authenticate', function(data, clbk) {
    if (!data.apiKey || data.apiKey.length === 0) {
      clbk({ success: false, reason: 'apiKey is required' });
      return;
    }

    User.filter(r.row('apiKey').eq(data.apiKey)).run().then(function(results) {
      if (results.length === 0) {
        clbk({ success: false, reason: 'invalid apiKey' });
        return;
      }
      socket.authenticated = true;
      socket.user = results[0];
    });
  });

  socket.on('auth.login', function(data, clbk) {
    if (!data.email || data.email.length === 0) {
      clbk({ success: false, reason: 'email is required' });
      return;
    }
    if (!data.password || data.password.length === 0) {
      clbk({ success: false, reason: 'password is required' });
      return;
    }

    User.filter(r.row('email').eq(data.email)).run().then(function(results) {
      if (results.length === 0) {
        clbk({ success: false, reason: 'user not found' });
        return;
      }

      const user = results[0];
      bcrypt.compare(data.password, user.passwordHash, function(err, hashOkay) {
        if (!hashOkay) {
          clbk({ success: false, reason: 'password incorrect' });
          return;
        }

        user.apiKey = uuid.v4();
        user.save().then(()=> clbk({ success: true, apiKey: user.apiKey }));

        socket.authenticated = true;
        socket.user = user;
      });
    });
  });

  socket.on('auth.signup', function(data, clbk) {
    if (!data.name || data.name.length === 0) {
      clbk({ success: false, reason: 'name is required' });
      return;
    }
    if (!data.email || data.email.length === 0) {
      clbk({ success: false, reason: 'email is required' });
      return;
    }
    if (!data.password || data.password.length === 0) {
      clbk({ success: false, reason: 'password is required' });
      return;
    }

    bcrypt.genSalt(10, function(err, passwordSalt) {
      if (err) throw err;

      bcrypt.hash(data.password, passwordSalt, function(err, passwordHash) {
        if (err) throw err;

        const user = new User({
          name: data.name,
          email: data.email,
          apiKey: uuid.v4(),
          passwordHash,
          passwordSalt,
        });

        user.save().then(()=> clbk({ success: true, apiKey: user.apiKey }));

        socket.authenticated = true;
        socket.user = user;
      });
    });
  });
}
