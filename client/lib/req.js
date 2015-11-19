
import Cookies from 'cookies-js';


const csrfToken = Cookies.get('csrftoken');

export default function req(method, path, data) {
  const options = {};
  options.method = method.toUpperCase();
  options.headers = {
    'X-CSRFToken': csrfToken,
    'Content-Type': 'application/json',
  };

  if (data && options.method === 'POST')
    options.body = JSON.stringify(data);

  else if (data && options.method === 'GET')
    console.warn('TODO: support GET args in req');

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
