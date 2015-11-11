
import thinky from '../thinky';


export const User = thinky.createModel('User', {
  id: thinky.type.string(),
  email: thinky.type.string(),
  name: thinky.type.string(),
  passwordSalt: thinky.type.string(),
  passwordHash: thinky.type.string(),
  apiKey: thinky.type.string(),
});
