const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_db');

const byToken = async(token)=> {
  try {
    const { id } = jwt.verify(token, process.env.JWT);
    const { rows: [ user ] } = await client.query(`
      SELECT *
      FROM users
      WHERE Id=$1
    `, [id]);

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
    WHERE username=$1
  `, [username])
  
  if(user && await bcrypt.compare(password, user.password)){
    return jwt.sign({id: user.id}, process.env.JWT); 
  }
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

const syncAndSeed = async() => {
  try {
    await client.connect();
    console.log('CONNECTED TO DB');

    const passwords = ['curly_pw', 'moe_pw', 'larry_pw', 'lucy_pw'];
    const passwordPromises = passwords.map((pw) => {
      return bcrypt.hash(pw, 3);
    })

    Promise.all(passwordPromises)
      .then((hashedPasswords) => {
        const [curlyPW, moePW, larryPW, lucyPW] = hashedPasswords;

        client.query(`
          DROP TABLE IF EXISTS users;
      
          CREATE TABLE users(
            Id SERIAL PRIMARY KEY,
            Username VARCHAR(30) UNIQUE,
            Password VARCHAR(100)
          );
      
          INSERT INTO users(Username, Password) VALUES('curly', '${curlyPW}');
          INSERT INTO users(Username, Password) VALUES('moe', '${moePW}');
          INSERT INTO users(Username, Password) VALUES('larry', '${larryPW}');
          INSERT INTO users(Username, Password) VALUES('lucy', '${lucyPW}');
        `);
      });
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
