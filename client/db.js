
import PouchDB from 'pouchdb';

const DB_NAME = 'tester';

const db = new PouchDB(DB_NAME);
const remoteDb = new PouchDB(`http://localhost:5984/${DB_NAME}`);

db.sync(remoteDb, { live: true });

export default db;
