import React, { useState, useEffect } from 'react';

const SignIn = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const onChange = (ev) => {
    if(ev.target.name === 'username') {
      setUsername(ev.target.value);
    } else {
      setPassword(ev.target.value);
    }
  }

  const onSubmit = async(ev) => {
    ev.preventDefault();
    try{
      await props.signIn({
      username,
      password
    });
    } catch(err) {
      console.log(err);
      setError(err.response.data.error)
    }
  }

  return (
    <form onSubmit={ onSubmit }>
      { error }
      <input value={ username } onChange={ onChange } name='username'/>
      <input value={ password } onChange={ onChange } name='password'/>
      <button>Sign In</button>
    </form>
  );
}

export default SignIn;