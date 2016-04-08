
import Dialog from 'components/dialog';

import styles from 'sass/components/graphic-dialog.scss';


export default (props)=> {
  const {
      scheme,
      image,
      gif,
      header,
      paragraph,
      next,
      prev,
      onRequestClose,
      ...childProps,
  } = props;

  return (
    <Dialog
      className={`${styles.root} scheme-${scheme}`}
      onRequestClose={onRequestClose}
      size={null}
    >
      <div className='image'>
        <img src={image}/>
      </div>

      <div className='copy'>
        <h3>{header}</h3>
        <p>{paragraph}</p>
      </div>

      <div className='control-prev'>
        {prev ? prev : null}
      </div>

      <div className='control-next'>
        {next ? next : null}
      </div>
    </Dialog>
  );
};
