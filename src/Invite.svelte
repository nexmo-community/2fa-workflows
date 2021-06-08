<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let phone = '';

  function invite(e) {
    e.preventDefault();
    let body = JSON.stringify({
      phone: phone
    });
    fetch('/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    })
    .then(response => response.json())
    .then(data => {
      dispatch('invited', {
        phone: phone
      });
    })
    .catch(err => {
      console.error(err);
    });
    return false;
  }


</script>


<h2>
  Invite a Friend
</h2>

<form action="/login">
  <label>Phone number:
    <input type="tel" bind:value={phone} />
  </label>
  
  <button on:click={invite}>Send Invite Code</button>
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