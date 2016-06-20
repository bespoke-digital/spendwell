
import moment from 'moment'

// This hacks out the timezone info so everything displays in UTC, which is
// how it's stored on the server. This needs to be addressed.
moment.fn.asUtc = function () {
  return this.subtract(moment().utcOffset(), 'minutes')
}
