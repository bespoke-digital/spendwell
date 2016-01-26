
export default class Model {
  constructor(doc, collection) {
    this._raw = doc;
    this.collection = collection;
    Object.assign(this, doc);
  }
}
