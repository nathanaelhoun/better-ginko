"use strict";

/**
 * @typedef {Object} configItem
 * @property {int}      beginTime    - When the config should start to be active
 * @property {int}      endTime      - When the config should stop to be active
 * @property {string}   stop         - Bus stop where to check the buses
 * @property {string[]} destinations - Possible destinations for the bus
 * @property {string[]} test - Possible destinations for the bus
 */

/**
 * @var {configItem[]} config
 */
const config = [
	{
		"beginTime": 0,
		"endTime": 24,
		"stop": "Crous-Université",
		"destinations": ["Centre-ville - 8 Septembre", "République"],
	},
	{
		"beginTime": 0,
		"endTime": 24,
		"stop": "Isenbart",
		"destinations": ["Pôle Temis", "Crous-Université"],
	},
];

document.addEventListener("DOMContentLoaded", async function () {

	/**
	 * @returns {configItem}
	 */
	function getConfigFromTime() {
		const today = new Date();
		const now = today.getHours() + (today.getMinutes() / 100);

		for (const conf of config) {
			if (conf.beginTime <= now && now < conf.endTime) {
				return conf;
			}
		}

		throw Error("Le moment actuel n'est pas connu dans la config");
	}

	/**
	 * @param {string}   busStop 
	 * @param {string}   busLine 
	 * @param {string[]} busDestinations 
	 * @returns {Promise<string[]>} 
	 */
	async function getTimesForLine(busStop, busLine, busDestinations) {
		const response = await fetch(`https://api.ginko.voyage/TR/getTempsLieu.do?nom=${busStop}&nb=3`);

		const body = await response.json();

		const times = body.objets.listeTemps
			.filter((o) => o.numLignePublic === busLine)
			.filter((o) => busDestinations.includes(o.destination))
			.map((o) => o.temps);
		return times;
	};

	/** Fills the dom */
	/**
	 * 
	 * @param {string}   busStop 
	 * @param {string}   busLine 
	 * @param {string[]} busDestinations
	 * @param {string[]} times 
	 * @returns 
	 */
	function putResult(busStop, busLine, busDestinations, times) {
		document.getElementById("bus-line").innerText = busLine;
		document.getElementById("bus-stop").innerText = busStop;
		document.getElementById("bus-destination").innerText = busDestinations.join(' ou ');

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
		const times = await getTimesForLine(conf.stop, "L3", conf.destinations);
		putResult(conf.stop, "3", conf.destinations, times);
	};

	try {
		await findAndShowResults();
		setInterval(findAndShowResults, 10000);
	} catch (e) {
		console.error(e);
		document.getElementById("error").innerHTML = `<p>T'as pas de réseau bolosse</p><pre>${e}</pre>`;
	}
});
