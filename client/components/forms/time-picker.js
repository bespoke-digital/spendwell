
import { createClass } from 'react';
import Formsy from 'formsy-react';
import TimePicker from 'material-ui/lib/time-picker';

import 'material-ui-tap-hack';


export default createClass({
  mixins: [Formsy.Mixin],

  handleChange(_null, time) {
    this.setValue(`${time.getHours()}:${time.getMinutes()}`);
  },

  render() {
    // const errorMessage = this.getErrorMessage();
    let defaultTime;

    if (this.props.value) {
      defaultTime = new Date();
      [defaultTime.hour, defaultTime.minute] = this.props.value.split(':');
    }

    return (
      <TimePicker
        format='ampm'
        defaultTime={defaultTime}
        {...this.props}
        onChange={this.handleChange}
      />
    );
  },
});
