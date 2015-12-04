
import _ from 'lodash';
import { createClass, PropTypes } from 'react';
import Formsy from 'formsy-react';

import Dropdown from 'components/dropdown';

import styles from 'sass/components/forms/category-selector.scss';


const CategoriesDropdown = (props)=> {
  const { onSelect, selected, categories } = props;

  if (!categories.length) return <span/>;

  const label = selected ? `Category: ${selected.name}` : 'Category';

  return (
    <Dropdown label={label} variant='primary'>
      <a href='#' onClick={onSelect.bind(null, null)}>All</a>
      {categories.map((category, index)=> (
        <a href='#' key={index} onClick={onSelect.bind(null, category)}>
          {category.name}
        </a>
      ))}
    </Dropdown>
  );
};


export default createClass({
  mixins: [Formsy.Mixin],

  propTypes: {
    categories: PropTypes.array.isRequired,
    onChange: PropTypes.func,
  },

  getInitialState() {
    const { value, categories } = this.props;
    if (value)
      return { selected: [_.find(categories, { id: value })] };
    else
      return { selected: [] };
  },

  handleCategorySelect(index, category) {
    let { selected } = this.state;

    if (!category) {
      selected = selected.slice(0, index);

    } else {
      selected = selected.slice(0, index + 1);
      selected[index] = category;
    }
    this.setState({ selected });

    if (selected.length)
      this.setValue(selected.slice(-1)[0].id);
    else
      this.setValue(null);
  },

  render() {
    const { categories } = this.props;
    const { selected } = this.state;

    return (
      <div className={styles.root}>
        <CategoriesDropdown
          categories={categories}
          onSelect={this.handleCategorySelect.bind(this, 0)}
          selected={selected[0]}
        />
        {selected.map((category, index)=> (
          <CategoriesDropdown
            key={index}
            categories={category.children}
            onSelect={this.handleCategorySelect.bind(this, index + 1)}
            selected={selected[index + 1]}
          />
        ))}
      </div>
    );
  },
});
