
import _ from 'lodash'
import { createStore } from 'redux'


const defaultState = {
  loading: 0,
  toasts: [],
  chatlioOpen: false,
  scrollLock: false,
}

function reducer (state = defaultState, action) {
  switch (action.type) {
    case 'LOADING_START':
      return {
        ...state,
        loading: state.loading + 1,
      }
    case 'LOADING_STOP':
      return {
        ...state,
        loading: state.loading - 1,
      }
    case 'PUSH_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      }
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: _.without(state.toasts, action.toast),
      }
    case 'CHATLIO_OPEN':
      return {
        ...state,
        chatlioOpen: true,
      }
    case 'CHATLIO_CLOSED':
      return {
        ...state,
        chatlioOpen: false,
      }
    case 'LOCK_SCROLL':
      document.body.classList.add('scroll-lock')
      return {
        ...state,
        scrollLock: true,
      }
    case 'RELEASE_SCROLL':
      document.body.classList.remove('scroll-lock')
      return {
        ...state,
        scrollLock: false,
      }
    default:
      return state
  }
}


const store = createStore(reducer)

export default store
