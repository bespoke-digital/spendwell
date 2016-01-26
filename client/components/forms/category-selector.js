
import { Component } from 'react';
import Formsy from 'formsy-react';
import reactMixin from 'react-mixin';

import Dropdown from 'components/dropdown';
import Categories from 'collections/categories';

import styles from 'sass/components/forms/category-selector.scss';


const CategoriesDropdown = (props)=> {
  const { onSelect, selected, categories } = props;

  if (!categories || !categories.length) return <span/>;

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


@reactMixin.decorate(Formsy.Mixin)
@reactMixin.decorate(ReactMeteorData)
export default class CategorySelector extends Component {
  constructor() {
    super();
    this.state = { selected: [] };
  }

  getMeteorData() {
    return {
      topLevel: Categories.find({ parent: null }).fetch(),
      children: this.state.selected.map((category)=> category.children()),
    };
  }

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
      this.setValue(selected.slice(-1)[0]._id);
    else
      this.setValue(null);
  }

  render() {
    const { topLevel, children } = this.data;
    const { selected } = this.state;

    return (
      <div className={styles.root}>
        <CategoriesDropdown
          categories={topLevel}
          onSelect={this.handleCategorySelect.bind(this, 0)}
          selected={selected[0]}
        />
        {selected.map((category, index)=> (
          <CategoriesDropdown
            key={index}
            categories={children[index]}
            onSelect={this.handleCategorySelect.bind(this, index + 1)}
            selected={selected[index + 1]}
          />
        ))}
      </div>
    );
  }
}
