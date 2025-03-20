<script lang="ts">
	import { onMount } from 'svelte';
	import { auth, db, saveVote } from '$lib/firebase.js';
	import {
		getAuth,
		createUserWithEmailAndPassword,
		signInWithEmailAndPassword,
		sendEmailVerification,
		signOut,
		onAuthStateChanged
	} from 'firebase/auth';
	import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
	import justin from '$lib/Justin.png';

	const names = import.meta.env.VITE_ABIMOTTO_STUDENT_LIST.split(",")
	let dropdownRef: HTMLElement;

let showMessage = false;

let email = '';
let benutzer = '';
let password = '';
let errorMessage = '';
let successMessage = '';
let isLoggedIn = false;
let secondVote = 99;
const options = [
	'Mabiokart - Nach 12 Jahren endlich am Ziel',
	'Therabi - Wir verlassen die Anstalt',
	'Abivegas - Um jeden Punkt gepokert',
	'Abicetamol - Der Schmerz hat ein Ende',
	'Abicalypse - Weltuntergang wäre leichter gewesen'
];

let startVote = false;
let questionIndex = 0;
let end = false;

let inputValue = '';
let isOpen = false;
let filteredNames: string[] = [];

function showError(msg: string) {
	showMessage = true;
	errorMessage = msg;
}

function showSuccess(msg: string) {
	showMessage = true;
	successMessage = msg;
}

onMount(async () => {
	filteredNames = [...names];
	document.addEventListener('click', handleClickOutside);
	onAuthStateChanged(auth, async (firebaseUser) => {
		if (firebaseUser) {
			isLoggedIn = true;
		} else {
			isLoggedIn = false;
		}
	});
});

async function register() {
	console.log(benutzer);
	email = benutzer + '@example.com';
	console.log(email);
	try {
		if (names.includes(benutzer)) {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			showSuccess('Registrierung erfolgreich!');
			login();
		} else {
			showError('Fehler: Benutzer nicht in Schülerliste');
		}
	} catch (error) {
		if (error.message === 'Firebase: Error (auth/email-already-in-use).') {
			showError(
				'Ein Accout under dem Namen wurde bereits erstellt. Entweder du versuchst dich erneut anzumelden und musst auf "Login" drücken. ODER jemand anders hat sich in deinem Namen registriert, dann melde dich bitte bei Emil Schuster.'
			);
		} else {
			showError('Fehler bei der Registrierung: ' + error.message);
		}
	}
}

async function login() {
	email = benutzer + '@example.com';
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		isLoggedIn = true;
		showSuccess('Login erfolgreich!');
	} catch (error) {
		showError('Login fehlgeschlagen: ' + error.message);
	}
}

function setVote(n: number) {
	secondVote = n;
}

async function submitVote() {
	if (secondVote === 99) return;
	end = true;
	try {
		const user = auth.currentUser;
		if (!user) {
			showError('Du musst eingeloggt sein!');
			return;
		}
		await setDoc(
			doc(db, 'votes', String(user.email)),
			{ secondVote, timestamp: new Date() },
			{ merge: true }
		);
		console.log('Erfolgreich gespeichert!');
	} catch (error) {
		console.log('Fehler beim Speichern: ' + error.message);
	}
}

function searchNames() {
	if (inputValue.trim() === '') {
		filteredNames = [...names];
	} else {
		filteredNames = names.filter((name) => name.toLowerCase().includes(inputValue.toLowerCase()));
	}
}

function selectName(name: string) {
	inputValue = name;
	isOpen = false;
}

function handleClickOutside(event: MouseEvent) {
	showMessage = false;
	errorMessage = '';
	successMessage = '';
	if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
		isOpen = false;
	}
	benutzer = inputValue;
}
</script>

{#if isLoggedIn}
{#if !startVote && !end}
	<div style="display: flex; justify-content: center">
		<div>
			<h1 style="color: darkblue; margin-bottom: 10px; margin-top:50px; text-align: center">
				Abi Motto Umfrage
			</h1>
			<p style="text-align: center">
				Du bekommst die Top {options.length} Entscheidungen der letzten Runde angezeigt.
			</p>
			<p style="text-align: center">Du darfst eine Stimme vergeben.</p>

			<div style="display: flex; justify-content: center; margin-bottom: 20px">
				<div style="background-color: lightblue; padding: 20px; border-radius: 5px; width: 90%">
					{#each options as option, n}
						<div style="display: flex; align-items: center; margin-top: 15px;">
							<button
								on:click={() => setVote(n)}
								style="width: 30px; min-width:30px; height: 30px; margin-right: 10px; border-width: 3px; border-color: rgb(50, 50, 50); background-color: {secondVote ===
								n
									? 'green'
									: 'white'}"
								aria-label="select-Button"
							></button>
							<div>
								<p style="margin-bottom: 0px;">
									{options[n]}
								</p>
							</div>
						</div>
					{/each}
					<div style="display: flex; justify-content: center">
						<button class="submit" on:click={submitVote}>Absenden</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else if end}
	<button on:click={() => signOut(auth)}>O</button>
	<div
		style="
display: flex; 
flex-direction: column; 
align-items: center; 
justify-content: center; 
height: 90vh; 
font-family: Arial, sans-serif; 
text-align: center;
"
	>
		<div
			style="
	background: white; 
	padding: 40px; 
	border-radius: 10px; 
	box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); 
	max-width: 450px; 
	width: 90%;
"
		>
			<h2 style="font-size: 1.8em; color: #333; margin-bottom: 15px; margin-top: 50px">
				Bewertung abgeschlossen
			</h2>
			<div style="justify-content: center; display: flex">
				<img src={justin} alt="Justin" style="width: 150px; height: 150px" />
			</div>
			<p style="font-size: 1.2em; color: #666; margin-bottom: 25px;">
				Deine Bewertung wurde gespeichert!
			</p>
			<p style="font-size: 11px">
				Ergebnisse werden erst am Ende der Wahlzeit veröffentlicht um Beeinflussung zu verhindern.
			</p>
		</div>
	</div>
{/if}
{:else}
<div class="login-container">
	<div style="display: flex; justify-content: center; flex-wrap: wrap; ">
		<h1 style="font-size: 50px;">Abi am AMG</h1>
		<p style="flex-basis: 100%; text-align: center; margin-top: 1px">Melde dich so an:</p>
		<p style="flex-basis: 100%; text-align: center; margin-top: 1px">
			1. Wähle oben deinen Namen aus
		</p>
		<p style="flex-basis: 100%; text-align: center; margin-top: 1px">
			2. Such dir ein 6-Stelliges Passwort aus
		</p>
		<p style="flex-basis: 100%; text-align: center; margin-top: 1px">
			3. Drücke auf Registrieren wenn du noch kein Account hast
		</p>
		<p style="flex-basis: 100%; text-align: center; margin-top: 1px">sonst auf Login</p>
	</div>
	<div class="login-box">
		<h2 class="login-title">Login / Registrierung</h2>

		<div
			class="auswahl"
			bind:this={dropdownRef}
			style="justify-content:center; display: flex; width: 100%"
		>
			<input
				type="text"
				bind:value={inputValue}
				on:input={searchNames}
				on:focus={() => ((isOpen = true), console.log(isOpen))}
				placeholder="Benutzername"
				class="login-input"
				style="margin-bottom: 10px;"
			/>
			{#if isOpen}
				<div class="menu">
					{#each filteredNames as name}
						<button class="item" on:click={() => selectName(name)}>
							{name}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<input type="password" bind:value={password} placeholder="Passwort" class="login-input" />

		<button on:click={register} class="login-button">Registrieren</button>
		<button on:click={login} class="login-button">Login</button>
		{#if errorMessage}
			<p style="color: red;">{errorMessage}</p>
		{/if}

		{#if successMessage}
			<p style="color: green;">{successMessage}</p>
		{/if}
	</div>
</div>
{/if}

<style>
.submit {
	margin-top: 30px;
	width: 200px;
	height: 50px;
	background-color: blue;
	border-radius: 5px;
	color: white;
	border-width: 0;
	font-size: 30px;
}

.login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	background-color: #f4f4f4;
	padding: 20px;
}

/* Login-Box mit fester Breite */
.login-box {
	background: white;
	padding: 30px;
	border-radius: 12px;
	box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
	max-width: 350px;
	width: 100%;
	text-align: center;
}

/* Titel */
.login-title {
	font-size: 24px;
	color: #333;
	margin-bottom: 20px;
	font-weight: bold;
}

/* Eingabefelder */
.login-input {
	width: 100%;
	padding: 12px;
	border: 1px solid #ccc;
	border-radius: 8px;
	font-size: 16px;
	transition: border-color 0.3s ease;
	box-sizing: border-box;
}

.login-input:focus {
	border-color: #007bff;
	outline: none;
}

/* Buttons */
.login-button {
	width: 100%;
	padding: 12px;
	font-size: 16px;
	color: white;
	background: #007bff;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	transition:
		background 0.3s ease,
		transform 0.2s ease;
	margin-top: 10px;
	box-sizing: border-box;
}

.login-button:hover {
	background: #0056b3;
	transform: scale(1.05);
}

/**-----------------------------------------------------------------------------------------------------------------------------*/
.auswahl {
	position: relative;
	width: 250px;
}
.menu {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	max-height: 200px;
	overflow-y: auto;
	background: white;
	border: 1px solid #ccc;
	border-radius: 5px;
	z-index: 10;
}
.item {
	padding: 8px;
	cursor: pointer;
	width: 100%;
}
.item:hover {
	background-color: #f0f0f0;
}
</style>
