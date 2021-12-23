"use strict";

const config = [
	{
		"beginTime": 0,
		"endTime": 12,
		"stop": "Crous-Université",
		"destination": "Centre-ville - 8 Septembre",
	},
	{
		"beginTime": 12,
		"endTime": 24,
		"stop": "Isenbart",
		"destination": "Pôle Temis",
	},
];

document.addEventListener("DOMContentLoaded", async function () {

	function getConfigFromTime() {
		const today = new Date();
		const now = today.getHours() + (today.getMinutes() / 100);

		for (const conf of config) {
			if (conf.beginTime <= now && now < conf.endTime) {
				return conf;
			}
		}

		throw Error("Ce moment n'est pas connu dans la config");
	}

	/** @returns {string[]} times */
	async function getTimesForLine(busStop, busLine, busDestination) {
		const response = await fetch(`https://api.ginko.voyage/TR/getTempsLieu.do?nom=${busStop}&nb=3`);
		const body = await response.json();
		const times = body.objets.listeTemps
			.filter((o) => o.destination == busDestination)
			.filter((o) => o.numLignePublic = busLine)
			.map((o) => o.temps);
		return times;
	};

	/** Fills the dom */
	function putResult(busStop, busLine, busDestination, times) {
		document.getElementById("bus-line").innerText = busLine;
		document.getElementById("bus-stop").innerText = busStop;
		document.getElementById("bus-destination").innerText = busDestination;

		if (!times) {
			document.getElementById("times").innerText = "Plus de bus aujourd'hui...";
			return;
		}

		document.getElementById("times").innerHTML = times
			.map((time) => `<li>${time}</li>`)
			.join("");
	}

	async function findAndShowResults() {
		const conf = getConfigFromTime();
		const times = await getTimesForLine(conf.stop, "L3", conf.destination);
		putResult(conf.stop, "3", conf.destination, times);
	};

	try {
		await findAndShowResults();
		setInterval(findAndShowResults, 10000);
	} catch (e) {
		console.error(e);
		document.getElementById("error").innerHTML = `<p>T'as pas de réseau bolosse</p><pre>${e}</pre>`;
	}
});
