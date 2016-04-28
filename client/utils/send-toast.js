
import store from 'store';


let id = 0;

export default function sendToast(message, actions, wait = 6000) {
  id++;
  const toast = { message, actions, id };

  store.dispatch({ type: 'PUSH_TOAST', toast });
  setTimeout(function() {
    store.dispatch({ type: 'REMOVE_TOAST', toast });
  }, wait);
}
