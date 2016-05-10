
import styles from 'sass/components/spinner.scss';


export default (props)=> {
  const { className, ..._props } = props;
  return (
    <svg
      viewBox='0 0 66 66'
      className={`spinner ${className || ''} ${styles.root}`}
      {..._props}
    >
       <circle
         fill='none'
         strokeWidth='6'
         strokeLinecap='round'
         cx='33'
         cy='33'
         r='30'
        />
    </svg>
  );
};
