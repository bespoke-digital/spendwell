
import Icon from 'components/icon';


export default class BookmarkOutlineIcon extends Icon {
  type = 'bookmark-outline';

  renderInternal() {
    return (
      <g><path d='M17 3h-10c-1.1 0-1.99.9-1.99 2l-.01 16 7-3 7 3v-16c0-1.1-.9-2-2-2zm0 15l-5-2.18-5 2.18v-13h10v13z'></path></g>
    );
  }
}
