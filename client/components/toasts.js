
import { TransitionMotion, spring } from 'react-motion';

import styles from 'sass/components/toasts';

export default ({ toasts, className, ...props })=>
  <TransitionMotion
    willLeave={()=> ({ opacity: spring(0), marginTop: spring(0) })}
    willEnter={()=> ({ opacity: 0, marginBottom: -20 })}
    styles={toasts.map((toast)=> ({
      toast,
      styles: { opacity: 1, marginBottom: 0, marginTop: 20 },
    }))}
  >{(styles)=> (
    <ul className={`${styles.root} ${className || ''}`} {...props}>
      {styles.map(({ toast, styles })=>
        <li key={toast.id} style={styles}>{toast.message}</li>
      )}
    </ul>
  )}</TransitionMotion>;
