
import { TransitionMotion, spring } from 'react-motion';

import styles from 'sass/components/toasts';

export default ({ toasts, className, ...props })=>
  <ul className={`${styles.root} ${className || ''}`} {...props}>
    <TransitionMotion
      willLeave={()=> ({ opacity: spring(0), marginTop: spring(0) })}
      willEnter={()=> ({ opacity: 0, marginBottom: -20 })}
      styles={toasts.map((toast)=> ({
        toast,
        styles: { opacity: 1, marginBottom: 0, marginTop: 20 }
      }))}
    >
      {(styles)=> styles.map(({ toast, styles })=>
        <li key={toast.id} styles={styles}>{toast.message}</li>
      )}
    </TransitionMotion>
  </ul>;
