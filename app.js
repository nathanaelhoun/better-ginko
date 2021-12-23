"use strict";

document.addEventListener("DOMContentLoaded", async function () {
	/** @returns {string[]} times */
	async function getTimesForLine(busStopId, busLine, destination) {
		const response = await fetch(`https://api.ginko.voyage/TR/getTempsLieu.do?idArret=${busStopId}&nb=3`);
		const body = await response.json();
		const times = body.objets.listeTemps
			.filter((o) => o.destination == destination)
			.filter((o) => o.numLignePublic = busLine)
			.map((o) => o.temps);
		return times;
	};

	function putResult(busStop, busLine, times) {
		document.getElementById("bus-line").innerText = busLine;
		document.getElementById("bus-stop").innerText = busStop;

		if (!times) {
			document.getElementById("times").innerText = "Plus de bus aujourd'hui...";
			return;
		}

		document.getElementById("times").innerHTML = times
			.map((time) => `<li>${time}</li>`)
			.join("");
	}

	try {
		const times = await getTimesForLine("ISENBAR1", "L3", "Pôle Temis");
		putResult("Isenbart", "3", times);
		setInterval(async () => {
			const times = await getTimesForLine("ISENBAR1", "L3", "Pôle Temis");
			putResult("Isenbart", "3", times);
		}, 10000);
	} catch (e) {
		console.error(e);
		document.getElementById("error").innerHTML = `<p>T'as pas de réseau bolosse</p><pre>${e}</pre>`;
	}
});
