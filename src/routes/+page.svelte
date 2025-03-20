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
	import { user } from '$lib/authStore.js';

	const names = import.meta.env.VITE_ABIMOTTO_STUDENT_LIST.split(",")
	let dropdownRef: HTMLElement;

	let showMessage = false

	let email = '';
	let benutzer = '';
	let password = '';
	let errorMessage = '';
	let successMessage = '';
	let isLoggedIn = false;
	const options = [
  "Abinoj",
  "Abiflix",
  "Shabi Holmes",
  "Abivegas",
  "Habi Potter",
  "Abiana Jones",
  "Abikini",
  "HABIBO",
  "Abiagra",
  "Abiletten",
  "A little Party never killed no Abi",
  "Mabiokart", 
  "Abier",
  "Game of Abi",
  "Therabi",
  "Abios Amigos",
  "Abi Colada",
  "Alabin",
  "Stabil",
  "Abirol Spritz",
  "Abireal",
  "Abicetamol",
  "Abikropolis",
  "Chat ABiT",
  "Abicalypse",
  "Ability",
  "Abigasmus",
  "Abipunktur",
  "Cannabis",
  "Abi 2,026‰",
  "Tirabisu",
  "Barbie",
  "Abinopoly",
  "Abischlumpf",
  "ABBI",
  "ABIentchen",
  "Hakuna Matabi",
  "Kokabin",
  "Teletabi",
  "Butzbach Abiwachsenen Vollzug"
];

const sloagans = [
  "12 schwarze Jahre sind vorbei",
  "Nach 12 Staffeln endlich abgesetzt",
  "Den Abschluss gelöst, die Punkte leider nicht",
  "Um jeden Punkt gepokert",
  "Schule war Vol De Mort",
  "Die Jagd nach den verlorenen Punkten",
  "Knapp aber passt schon",
  "Macht Schüler froh und die Lehrer ebenso",
  "Unser Abi steht",
  "Mehr Streifen als Punkte",
  "",
  "Nach 12 Jahren endlich am Ziel",
  "Wenigstens die Maß hat 1,0",
  "Der Thron gehört uns",
  "Wir verlassen die Anstalt",
  "Nach Siesta kommt Fiesta",
  "Hauptsache Rum",
  "In jeder Flasche steckt ein Genie",
  "Mental nicht aber ich hab Abi",
  "Bitter süßes Ende",
  "Nur 2 Minuten aufnahmefähig",
  "Der Schmerz hat ein Ende",
  "Die Götter verlassen den Olymp",
  "Keine Fragen blieben offen",
  "Weltuntergang wäre leichter gewesen",
  "Zu allem fähig aber zu nichts zu gebrauchen",
  "12 Jahre bis zum Höhepunkt",
  "Jeder Punkt kostet Nerven",
  "12 Jahre durchgezogen",
  "Meist Dichter als Denker",
  "Auch die Creme de la Creme muss mal gehen",
  "Yes we Ken",
  "Nach 12 Jahren endlich auf freien Fuß",
  "Immer blau trotzdem schlau",
  "The winner takes it all",
  "Ente gut alles gut",
  "Haste Abi biste König",
  "Wir haben die Nase voll",
  "Winke Winke",
  ""
];
	let votes: number[] = [];
	let startVote = false;
	let questionIndex = 0;
	let end = false;

	let inputValue = '';
	let isOpen = false;
	let filteredNames: string[] = [];

	let optionsBackground = 'lightblue';

	function showError(msg: string) {
		showMessage = true
		errorMessage = msg;
		// setTimeout(() => (errorMessage = ''), 5000);
	}

	function showSuccess(msg: string) {
		showMessage = true
		successMessage = msg;
		// setTimeout(() => (successMessage = ''), 5000);
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

	async function loadVotes() {
		try {
			const user = auth.currentUser;
			if (!user) {
				showError('Du musst eingeloggt sein!');
				return;
			}
			const docRef = doc(db, 'votes', String(user.email));
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				console.log('Got DIng');
				votes = docSnap.data().votes || new Array(options.length).fill(0);;
				console.log(votes)
			} else {
				showError('Keine Optionen gefunden.');
			}
		} catch (error: any) {
			console.log('Fehler:', error.message);
			showError('Fehler beim Laden der Optionen: ' + error.message);
		}
	}

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
				showError('Ein Accout under dem Namen wurde bereits erstellt. Entweder du versuchst dich erneut anzumelden und musst auf "Login" drücken. ODER jemand anders hat sich in deinem Namen registriert, dann melde dich bitte bei Emil Schuster.')
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

	function logout() {
		signOut(auth);
		isLoggedIn = false;
	}

	async function submitVote() {
		try {
			const user = auth.currentUser;
			if (!user) {
				showError('Du musst eingeloggt sein!');
				return;
			}
			await setDoc(doc(db, 'votes', String(user.email)), { votes, timestamp: new Date() });
			showSuccess('Erfolgreich gespeichert!');
		} catch (error) {
			showError('Fehler beim Speichern: ' + error.message);
		}
	}

	function nextMotto(grade: number) {
		if (grade === -1) {
			questionIndex--;
			startVote = true;
			end = false;
			return;
		}
		votes[questionIndex] = grade;
		questionIndex++;
		if (questionIndex === options.length) {
			startVote = false;
			end = true;
			submitVote();
		}
		optionsBackground = 'white';
		setTimeout(() => {
			optionsBackground = 'lightblue';
		}, 100);
	}

	// Funktion für die Suche
	function searchNames() {
		if (inputValue.trim() === '') {
			filteredNames = [...names];
		} else {
			filteredNames = names.filter((name) => name.toLowerCase().includes(inputValue.toLowerCase()));
		}
	}

	// Name auswählen und Dropdown schließen
	function selectName(name: string) {
		inputValue = name;
		isOpen = false;
	}

	// Funktion zum Schließen, wenn außerhalb geklickt wird
	function handleClickOutside(event: MouseEvent) {
		showMessage = false
		errorMessage = ''
		successMessage = ''
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
		benutzer = inputValue;
	}
</script>
{#if isLoggedIn}
	{#if !startVote && !end}
		<div
			style="display: flex; flex-direction: column; align-items: center; text-align: center; font-family: Arial, sans-serif;"
		>
			<h1 style="color: darkblue; margin-bottom: 10px; margin-top:50px">Abi Motto Umfrage</h1>

			<p style="max-width: 600px; font-size: 1.1em;">
				Sobald du startest, wird dir ein Abimotto angezeigt. Du kannst es dann auf einer Skala von 1
				bis 5 bewerten:
			</p>

			<div
				style="background: #f8f9fa; padding: 15px 20px; border-radius: 10px; box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); margin-top: 10px;"
			>
				<p style="margin: 5px 0; font-weight: bold; color: #d60000;">1 - Gefällt mir gar nicht</p>
				<!-- Dunkelrot -->
				<p style="margin: 5px 0; font-weight: bold; color: #ff4500;">2 - Eher schlecht</p>
				<!-- Orange-Rot -->
				<p style="margin: 5px 0; font-weight: bold; color: #ffcc00;">3 - Ist okay / Neutral</p>
				<!-- Gelb -->
				<p style="margin: 5px 0; font-weight: bold; color: #33cc33;">4 - Gefällt mir</p>
				<!-- Grün -->
				<p style="margin: 5px 0; font-weight: bold; color: #007aff;">5 - Richtig gut!</p>
				<!-- Blau -->
			</div>
			<p style="max-width: 600px; font-size: 1.1em;">
				Deine Bewertung wird erst ganz am Ende registriert und gespeichert!
			</p>

			<button
				class="login-button"
				style="width: 300px; margin-top: 20px;"
				on:click={() => (startVote = true, loadVotes())}>Zur Umfrage</button
			>
		</div>
	{:else if startVote}
		<div
			style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        height: 100vh; 
        font-family: Arial, sans-serif; 
    "
		>
			<div
				style="
            background: {optionsBackground}; 
            padding: 30px; 
            border-radius: 15px; 
            box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.2); 
            text-align: center; 
            max-width: 500px; 
            width: 90%;
			postition:relative;
        "
			>
				{#if questionIndex > 0}
					<div style="position: relative; width:100%">
						<button
							style="position: absolute; top: 5px; left: 5px; padding: 4px 8px; font-size: 14px; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; transition: background 0.2s ease-in-out;"
							on:click={() => nextMotto(-1)}
						>
							Zurück
						</button>
					</div>
				{/if}
				<p
					style="font-size: 1.5em; font-weight: bold; color: #555; margin-bottom: 20px; margin-top: 0"
				>
					{questionIndex + 1} / {options.length}
				</p>


				<h1 style="margin: 60px 0 0; font-size: 3em; color: #222;">{options[questionIndex]}</h1>
				<h2 style="margin-bottom: 50px; font-size: 30px; margin-top:20px">{sloagans[questionIndex]}</h2>


				<div style="display: flex; justify-content: center; gap: 5px; margin-top: 30px;">
					<button
						style=" padding: 15px 20px; font-size: 1.5em; border: none; border-bottom-left-radius: 8px; border-top-left-radius: 8px; color: white; cursor: pointer; background-color: {votes[
							questionIndex
						] === 1
							? 'blue'
							: 'gray'}"
						on:click={() => nextMotto(1)}>1</button
					>
					<button
						style="padding: 15px 20px; font-size: 1.5em; border: none; color: white; cursor: pointer; background-color: {votes[
							questionIndex
						] === 2
							? 'blue'
							: 'gray'}"
						on:click={() => nextMotto(2)}>2</button
					>
					<button
						style="padding: 15px 20px; font-size: 1.5em; border: none; color: white; cursor: pointer; background-color: {votes[
							questionIndex
						] === 3
							? 'blue'
							: 'gray'}"
						on:click={() => nextMotto(3)}>3</button
					>
					<button
						style="padding: 15px 20px; font-size: 1.5em; border: none; color: white; cursor: pointer; background-color: {votes[
							questionIndex
						] === 4
							? 'blue'
							: 'gray'};"
						on:click={() => nextMotto(4)}>4</button
					>
					<button
						style="padding: 15px 20px; font-size: 1.5em; border: none; border-top-right-radius: 8px; border-bottom-right-radius: 8px; color: white; cursor: pointer; background-color: {votes[
							questionIndex
						] === 5
							? 'blue'
							: 'gray'}"
						on:click={() => nextMotto(5)}>5</button
					>
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
        height: 100vh; 
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
				<div style="position: relative; width:100% margin-bottom: 10px">
					<button
						style="position: absolute; top: 5px; left: 5px; padding: 4px 8px; font-size: 14px; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; transition: background 0.2s ease-in-out;"
						on:click={() => nextMotto(-1)}
					>
						Zurück
					</button>
				</div>
				<h2 style="font-size: 1.8em; color: #333; margin-bottom: 15px; margin-top: 50px">
					Bewertung abgeschlossen
				</h2>
				<p style="font-size: 1.2em; color: #666; margin-bottom: 25px;">
					Deine Bewertung wurde gespeichert!
				</p>

				<button
					style="
                padding: 12px 24px; 
                font-size: 1em; 
                border: none; 
                border-radius: 6px; 
                background: #444; 
                color: white; 
                cursor: pointer;
            "
			on:click={() => window.location.href = "./ergebnis"}
				>
					Zu den Ergebnissen
				</button>
			</div>
		</div>
	{/if}
{:else}
	<div class="login-container">
		<div style="display: flex; justify-content: center; flex-wrap: wrap; ">
			<h1 style="font-size: 50px;">Abi am AMG</h1>
			<p style="flex-basis: 100%; text-align: center; margin-top: 1px">Melde dich so an:</p>
			<p style="flex-basis: 100%; text-align: center; margin-top: 1px">1. Wähle oben deinen Namen aus</p>
			<p style="flex-basis: 100%; text-align: center; margin-top: 1px">2. Such dir ein 6-Stelliges Passwort aus</p>
			<p style="flex-basis: 100%; text-align: center; margin-top: 1px">3. Drücke auf Registrieren wenn du noch kein Account hast</p>
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
	/* Container für zentriertes Layout */
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

	/*-------------------------------------------------------------------------------------------------*/

	/* Gesamte Seite zentrieren */
	.register-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background-color: #f4f4f4;
		padding: 20px;
	}

	/* Container für Nachricht & Button */
	.register-container {
		background: white;
		padding: 20px;
		border-radius: 12px;
		box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
		max-width: 350px;
		width: 100%;
		text-align: center;
	}

	/* Hinweistext */
	.register-message {
		font-size: 16px;
		color: #333;
		margin-bottom: 15px;
		font-weight: bold;
	}

	/* Logout-Button */
	.register-button {
		width: 100%;
		padding: 12px;
		font-size: 16px;
		color: white;
		background: #dc3545;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition:
			background 0.3s ease,
			transform 0.2s ease;
		box-sizing: border-box;
	}

	.register-button:hover {
		background: #b52b3a;
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
