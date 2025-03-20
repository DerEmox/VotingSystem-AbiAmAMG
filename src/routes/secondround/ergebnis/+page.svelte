<script lang="ts">
    import { onMount } from 'svelte';
    import { db, auth } from '../../../lib/firebase.js';
    import { signInWithEmailAndPassword } from 'firebase/auth';
    import { collection, getDocs } from 'firebase/firestore';

    let votes = [];
    let totalVotes = 0;
    let totalFirstVotes = 0;
    let mostVotes = 0;
    let userAuthenticated = false;
    let code = '';
    let error = '';

    const options = [
        'Mabiokart - Nach 12 Jahren endlich am Ziel',
        'Therabi - Wir verlassen die Anstalt',
        'Abivegas - Um jeden Punkt gepokert',
        'Abicetamol - Der Schmerz hat ein Ende',
        'Abicalypse - Weltuntergang wäre leichter gewesen'
    ];
    let voteCounts = new Array(options.length).fill(0);

    async function login() {
        const email = 'admin@example.com';

        try {
            const result = await signInWithEmailAndPassword(auth, email, code);
            console.log('Erfolgreich eingeloggt:', result.user);
            userAuthenticated = true;
            error = ''; // Fehler zurücksetzen
            fetchVotes();
        } catch (err) {
            error = 'Fehler bei der Anmeldung: ' + err.message;
            console.log(error);
        }
    }

    async function fetchVotes() {
        
getEmailsWithoutSecondVote()
        voteCounts = new Array(options.length).fill(0);
        votes = [];
        totalVotes = 0;
        totalFirstVotes = 0;
        mostVotes = 0;
        const votesCollection = collection(db, 'votes');
        const snapshot = await getDocs(votesCollection);
        const allVotes = snapshot.docs.map((doc) => doc.data());

        const firstVoteEntries = allVotes.filter((doc) => doc.votes !== undefined);
        totalFirstVotes = firstVoteEntries.length;
        const secondVoteEntries = allVotes.filter((doc) => doc.secondVote !== undefined);
        totalVotes = secondVoteEntries.length;

        votes = secondVoteEntries.map((doc) => doc.secondVote);

        votes.forEach((vote) => {
            if (vote >= 0 && vote < options.length) {
                voteCounts[vote]++;
            }
        });

        for (let i = 0; i < voteCounts.length; i++) {
            if (voteCounts[i] > mostVotes) {
                mostVotes = voteCounts[i];
            }
        }
    }

    export async function getEmailsWithoutSecondVote(): Promise<string[]> {
  const votesRef = collection(db, "votes");
  const snapshot = await getDocs(votesRef);

  const emailsWithoutSecondVote: string[] = [];

  snapshot.forEach((doc) => {
    if (!("secondVote" in doc.data())) {
      emailsWithoutSecondVote.push(doc.id); // Die E-Mail ist der Dokumentname
    }
  });

  console.log("E-Mails ohne secondVote:", emailsWithoutSecondVote);
  return emailsWithoutSecondVote;
}

</script>

<main>
    {#if !userAuthenticated}
        <h1>Administator Login</h1>
        <div class="login-container">
            <input type="password" bind:value={code} placeholder="Geben Sie den Admin-Code ein" />
            <button on:click={login}>Anmelden</button>
            <p class="error-message">{error}</p>
        </div>
    {:else}
        <h1>Vote Auswertung</h1>
        <p>Gesamtstimmen erste Wahl: {totalFirstVotes}</p>
        <p style="margin-top: 0; margin-bottom: 50px">Gesamtstimmen diese Wahl: {totalVotes}</p>
        {#each options as option, index}
            <div class="vote-container">
                <p>{option}: {voteCounts[index]} Stimmen</p>
                <div class="progress-bar">
                    <div
                        class="progress"
                        style="width: {mostVotes > 0 ? (voteCounts[index] / mostVotes) * 100 + '%' : '0%'}"
                    ></div>
                </div>
            </div>
        {/each}
        <button on:click={fetchVotes}>Neuladen</button>
    {/if}
</main>


<style>
	main {
		font-family: Arial, sans-serif;
		text-align: center;
		max-width: 600px;
		margin: 20px auto;
		background: #f9f9f9;
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	}

	.vote-container {
		margin: 15px 0;
	}

	.progress-bar {
		width: 100%;
		height: 20px;
		background: #e0e0e0;
		border-radius: 10px;
		overflow: hidden;
	}

	.progress {
		height: 100%;
		background: linear-gradient(90deg, #ff5722, #ff9800);
		transition: width 0.5s ease-in-out;
	}

	p {
		font-size: 16px;
		color: #444;
		margin-bottom: 5px;
	}

	main {
        font-family: 'Orbitron', sans-serif;
        text-align: center;
        max-width: 600px;
        margin: 20px auto;
        background: #f4f4f4;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    h1 {
        color: #222;
        font-size: 24px;
    }

    .login-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        background: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    input {
        width: 80%;
        padding: 10px;
        font-size: 16px;
        border: 2px solid #ccc;
        border-radius: 8px;
        text-align: center;
        transition: border 0.3s ease;
    }

    input:focus {
        border-color: #ff9800;
        outline: none;
        box-shadow: 0 0 8px rgba(255, 152, 0, 0.5);
    }

    button {
        background: linear-gradient(90deg, #ff9800, #ff5722);
        color: white;
        font-size: 16px;
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    button:hover {
        background: linear-gradient(90deg, #ff5722, #ff9800);
    }

    .error-message {
        color: #d32f2f;
        font-size: 14px;
        margin-top: 5px;
    }
</style>
