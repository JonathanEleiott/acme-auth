const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_db');

const byToken = async(token)=> {
  try {
    const { rows: [ user ] } = await client.query(`
      SELECT *
      FROM users
      WHERE Id=$1
    `, [token]);

    if(user){
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

const authenticate = async({ username, password })=> {
  const { rows: [ user ] } = await client.query(`
    SELECT *
    FROM users
    WHERE username=$1 AND password=$2
  `, [username, password])
  
  if(user){
    return user.id; 
  }
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

const syncAndSeed = async() => {
  try {
    await client.connect();
    console.log('CONNECTED TO DB');
    await client.query(`
      DROP TABLE IF EXISTS users;
  
      CREATE TABLE users(
        Id SERIAL PRIMARY KEY,
        Username VARCHAR(30) UNIQUE,
        Password VARCHAR(30)
      );
  
      INSERT INTO users(Username, Password) VALUES('curly', 'curly_pw');
      INSERT INTO users(Username, Password) VALUES('moe', 'moe_pw');
      INSERT INTO users(Username, Password) VALUES('larry', 'larry_pw');
      INSERT INTO users(Username, Password) VALUES('lucy', 'lucy_pw');
    `);
  } catch(err) {
    console.log(err);
  }
}

module.exports = {
  client,
  byToken,
  authenticate,
  syncAndSeed
}
