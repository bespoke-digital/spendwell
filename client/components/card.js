
import styles from 'sass/components/card.scss';


export default (props)=> {
  const { expanded, className } = props;
  return (
    <div {...props} className={`
      card
      ${styles.root}
      ${expanded ? 'expanded' : ''}
      ${className ? className : ''}
    `}/>
  );
};
