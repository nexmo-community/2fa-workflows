<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let username = '';
  let pin = '';

  function auth(e) {
    e.preventDefault();
    let body = JSON.stringify({
      username: username,
      pin: pin
    });
    fetch('/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    })
    .then(response => response.json())
    .then(data => {
      dispatch('authed', {
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
  Authenticate
</h2>

<form action="/login">
  <label>Username:
    <input type="text" bind:value={username} readonly />
  </label>
  
  <label>PIN:
    <input type="text" bind:value={pin} />
  </label>
  
  <button on:click={auth}>Verify Code</button>
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