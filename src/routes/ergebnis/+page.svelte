<script lang="ts">
	import { onMount } from 'svelte';
	import { getFirestore, collection, getDocs } from 'firebase/firestore';
	import { app } from '../../lib/firebase.js';

	const db = getFirestore(app);

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
  "Chat Abit",
  "Abicalypse",
  "Ability",
  "Abigasmus",
  "Abipunktur",
  "Cannabis",
  "Abi 2,026",
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

const slogans = [
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

	let avgVotes: { option: string; slogan: string; avg: number | string }[] = [];
	let isLoading = true;

	async function fetchVotes() {
		let votesCollection = collection(db, 'votes');
		let votesSnapshot = await getDocs(votesCollection);

		let summedVotes = Array(options.length).fill(0);
		let countVotes = Array(options.length).fill(0);

		votesSnapshot.forEach((doc) => {
			let votes = doc.data().votes;
			if (Array.isArray(votes)) {
				votes.forEach((vote, index) => {
					if (index < options.length) {
						summedVotes[index] += vote;
						countVotes[index] += 1;
					}
				});
			}
		});

		avgVotes = options.map((option, index) => ({
			option,
			slogan: slogans[index],
			avg:
				countVotes[index] > 0 ? Number((summedVotes[index] / countVotes[index]).toFixed(2)) : 'N/A'
		}));

		// Sortiere nach avgVotes (höchster Wert zuerst)
		avgVotes.sort((a, b) => {
			const aValue = typeof a.avg === 'number' ? a.avg : -Infinity;
			const bValue = typeof b.avg === 'number' ? b.avg : -Infinity;
			return bValue - aValue;
		});

		isLoading = false;
	}

	onMount(fetchVotes);
</script>

<!-- 📌 Ladebildschirm -->
{#if isLoading}
	<div class="loading-container">
		<div class="loading-spinner"></div>
	</div>
{:else}
	<!-- 📌 Tabelle -->
	<div class="table-container">
		<h2>Abstimmungsergebnisse</h2>
		<table>
			<thead>
				<tr>
					<th>Option</th>
					<th>Slogan</th>
					<th>Bewertung</th>
				</tr>
			</thead>
			<tbody>
				{#each avgVotes as { option, slogan, avg }, i}
					<tr>
						<td>{option}</td>
						<td>{slogan}</td>
						<td class="avg-value {avg === 'N/A' ? 'gray' : 'green'}">{avg}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
	/* 📌 Loading-Screen */
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 5px solid rgba(0, 0, 255, 0.2);
		border-top-color: blue;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* 📌 Tabelle */
	.table-container {
		max-width: 800px;
		margin: 50px auto;
		background: white;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		overflow: hidden;
	}

	h2 {
		text-align: center;
		font-size: 1.8rem;
		margin-bottom: 20px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	thead {
		background: linear-gradient(to right, blue, indigo);
		color: white;
		text-transform: uppercase;
	}

	th,
	td {
		padding: 12px;
		border-bottom: 1px solid #ddd;
	}

	tbody tr:hover {
		background-color: #f3f3f3;
		transition: background 0.3s;
	}

	/* 📌 Hervorhebung der Bewertungen */
	.avg-value {
		font-weight: bold;
		font-size: 1.1rem;
		text-align: center;
	}

	.green {
		color: green;
	}
	.gray {
		color: gray;
	}
</style>
