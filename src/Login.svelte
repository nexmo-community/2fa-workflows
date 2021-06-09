<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let username = ''; 
  let showForgot = false;

  function logIn(e) {
    e.preventDefault();
    let body = JSON.stringify({
      username: username
    });
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    })
    .then(response => response.json())
    .then(data => {
      dispatch('loggedIn', {
        username: username
      });
    })
    .catch(err => {
      console.error(err);
    });;
    return false;
  }
</script>

<h2>
  Log in
</h2>

<form action="/login">
  <label>Username:
    <input type="text" bind:value={username} />
  </label>

  <label>Password:
    <input type="password" />
  </label>
  
  <button on:click={logIn}>Get Code</button>
  <br/><br/>
  <a on:click={e => showForgot = true}>Forgot password?</a>
</form>

<form class:hidden="{!showForgot}">
  <label>Username:
    <input type="text" bind:value={username} />
  </label>
  
  <button on:click={logIn}>Send Login Code</button>
</form>

<style>
  h2 {
    margin: 0 10% 5%;
    text-align: left;
  }

  form {
		margin: 0 10%;
		text-align: left;
	}

  .hidden {
		display: none;
	}
</style>