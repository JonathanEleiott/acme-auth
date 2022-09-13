import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SignIn from './SignIn';

const App = () => {
  const [auth, setAuth] = useState({});

  useEffect(() => {
    attemptTokenLogin()
  }, [])

  const signIn = async(credentials) => {
    let response = await axios.post('/api/auth', credentials);
    const { token } = response.data;
    window.localStorage.setItem('token', token);
    attemptTokenLogin();
  }

  const logout = () => {
    window.localStorage.removeItem('token');
    setAuth({});
  };

  const attemptTokenLogin = async() => {
    const token = window.localStorage.getItem('token');
    if(token){
      const response = await axios.get('/api/auth', {
        headers: {
          authorization: token
        }
      });
      setAuth(response.data);
    }
  }

  if(!auth.id){
    return <SignIn signIn={ signIn }/>
  }
  else {
    return (
      <div>
        Welcome { auth.username }
        <button onClick={ logout }>Logout</button>
      </div>
    );
  }
}

export default App;