
import { Component, PropTypes } from 'react';

import style from 'sass/components/progress';


const percent = (v, t)=> parseInt((Math.abs(v) / Math.abs(t)) * 100);


export default class Progress extends Component {
  static propTypes = {
    current: PropTypes.number.isRequired,
    target: PropTypes.number,
    marker: PropTypes.number,
    className: PropTypes.string,
    color: PropTypes.string,
  };

  static defaultProps = {
    target: 100,
    className: '',
  };

  render() {
    const { current, target, marker, className, color } = this.props;

    let progress = percent(current, target);
    const full = progress === 100;
    const over = progress > 100;

    if (over && progress <= 200)
      progress -= 100;
    else if (over)
      progress = 100;

    return (
      <div className={`
        progress
        ${className}
        ${style.root}
        ${over ? 'progress-over' : ''}
        ${full ? 'progress-full' : ''}
        ${color ? `progress-${color}` : ''}
      `}>
        <div className='bar' style={{
          width: `${progress === 100 ? 100 : progress % 100}%`,
        }}/>
        {marker ?
          <div className='marker' style={{
            left: `${marker === 100 ? 100 : marker % 100}%`,
          }}/>
        : null}
      </div>
    );
  }
}
