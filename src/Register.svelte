<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  let phone = '';
  let username = '';
  let pin = '';

  function register(e) {
    e.preventDefault();
    let body = JSON.stringify({
      phone: phone,
      username: username,
      pin: pin
    });
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    })
    .then(response => response.json())
    .then(data => {
      dispatch('registered', {
        username: username
      });
    })
    .catch(err => {
      console.error(err);
    });
    return false;
  }
</script>


<h2>
  Register
</h2>

<form action="/register">
  <label>Phone number:
    <input type="tel" bind:value={phone} />
  </label>
  
  <label>Username:
    <input type="text" bind:value={username} />
  </label>
  
  <label>PIN:
    <input type="text" bind:value={pin} />
  </label>
  
  <button on:click={register}>Verify Code & Register</button>
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