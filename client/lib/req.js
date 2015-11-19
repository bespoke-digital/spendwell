
import _ from 'lodash';
import Cookies from 'cookies-js';
import store from 'store';


const csrfToken = Cookies.get('csrftoken');


function urlencode(data) {
  _.map(data, (val, key)=> `${key}=${encodeURIComponent(val)}`).join('&');
}


export default function req(method, path, data) {
  const state = store.getState();
  const options = {};
  options.method = method.toUpperCase();
  options.headers = {
    'X-CSRFToken': csrfToken,
    'Content-Type': 'application/json',
  };

  if (state.auth.token)
    options.headers.Authorization = `Token ${state.auth.token}`;

  if (data && options.method === 'POST')
    options.body = JSON.stringify(data);

  else if (data && options.method === 'GET')
    path += `?${urlencode(data)}`;

  return new Promise(function(resolve, reject) {
    fetch(path, options).then((response)=> {
      if (response.status > 399) {
        reject(response);
      } else {
        response.json().then(resolve);
      }
    });
  });
}

export function dispatchReq(method, path, data, dispatch, successAction, failAction) {
  if (_.isUndefined(failAction)) {
    [dispatch, successAction, failAction] = [data, dispatch, successAction];
    data = null;
  }

  return req(method, path, data).then(
    (response)=> dispatch({ type: successAction, response }),
    ()=> dispatch({ type: failAction })
  );
}
