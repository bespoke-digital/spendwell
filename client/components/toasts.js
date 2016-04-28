
import { TransitionMotion, spring } from 'react-motion';

import { root } from 'sass/components/toasts';

export default function({ toasts, className, ...props }) {
  return (
    <TransitionMotion
      willLeave={()=> ({ opacity: spring(0) })}
      willEnter={()=> ({ opacity: 0 })}
      styles={toasts.map((toast)=> ({
        key: toast.id,
        data: toast,
        style: { opacity: spring(1) },
      }))}
    >{(styles)=> (
      <ul className={`${root} ${className || ''}`} {...props}>
        {styles.map(({ key, data, style })=>
          <li
            key={key}
            style={style}
          >
            {data.message}
          </li>
        )}
      </ul>
    )}</TransitionMotion>
  );
}
