
import _ from 'lodash';
import styles from 'sass/components/card.scss';


export default (props)=> {
  const { expanded, className } = props;
  return (
    <div {...props} className={`
      card
      ${styles.root}
      ${!_.isUndefined(expanded) ? 'can-expand' : ''}
      ${expanded ? 'expanded' : ''}
      ${className ? className : ''}
    `}/>
  );
};
