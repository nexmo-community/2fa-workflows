<script>
	import Auth from './Auth.svelte';
	import Invite from './Invite.svelte';
	import Login from './Login.svelte';
	import Register from './Register.svelte';

	let user = { loggedIn: false };
	let mode = 'login';

	function invite() {
		mode = '';
	}
	function login(e) {
		user.name = e.detail.username;
		mode = 'auth';
	}
	function register(e) {
		user = {
			name: e.detail.username,
			loggedIn: true
		};
		mode = '';
	}
	function auth() {
		user.loggedIn = true;
		mode = '';
	}
</script>

	<nav id="loggedIn" class:hidden="{!user.loggedIn}">
		<button on:click={e => mode = 'invite'}>Invite Friends</button>
	</nav>

	<nav id="welcome" class:hidden="{user.loggedIn}">
		<button on:click={e => mode = 'login'}>Login</button>
		<button on:click={e => mode = 'register'}>Register</button>
		<button on:click={e => mode = 'auth'}>Authenticate PIN</button>
	</nav>

	<main>
		{#if mode == 'register'}
			<Register on:registered={register}/>
		{:else if mode == 'auth'}
			<Auth username={user.name} on:authed={auth}/>
		{:else if mode == 'invite'}
			<Invite on:invited={invite}/>
		{:else if mode == 'login'}
			<Login on:loggedIn={login}/>
		{/if}
	</main>


<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	form {
		margin: 0 10%;
		text-align: left;
	}

	.hidden {
		display: none;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>