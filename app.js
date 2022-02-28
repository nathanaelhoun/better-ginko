"use strict";

/**
 * @typedef {Object} configItem
 * @property {int}      beginTime                  - When the config should start to be active
 * @property {int}      endTime                    - When the config should stop to be active
 * @property {string}   stop                       - Bus stop where to check the buses
 * @property {Object}   destination                - Possible destinations for the bus
 * @property {string}   destination.numLignePublic - Number as sent from the API
 * @property {boolean}  destination.sensAller      - Direction as sent from the API
 * @property {string}   destination.label          - Name as shown in the UI
 */

/**
 * @var {configItem[]} config
 */
const config = [
	{
		"beginTime": 0,
		"endTime": 12,
		"stop": "Crous-Université",
		"destination": { numLignePublic: "L3", sensAller: true, label: "Centre - Ville" },
	},
	{
		"beginTime": 12,
		"endTime": 24,
		"stop": "Isenbart",
		"destination": { numLignePublic: "L3", sensAller: false, label: "Temis" },
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
	 * @param {object}   busDestination
	 * @returns {Promise<string[]>} 
	 */
	async function getTimesForLine(busStop, busDestination) {
		const response = await fetch(`https://api.ginko.voyage/TR/getTempsLieu.do?nom=${busStop}&nb=3`);

		const body = await response.json();

		const times = body.objets.listeTemps
			.filter((o) => busDestination.numLignePublic == o.numLignePublic)
			.filter((o) => busDestination.sensAller == o.sensAller)
			.map((o) => o.temps);
		return times;
	};

	/** Fills the dom */
	/**
	 * 
	 * @param {string}   busStop 
	 * @param {string}   busLine 
	 * @param {Object[]} busDestination
	 * @param {string[]} times 
	 * @returns 
	 */
	function putResult(busStop, busDestination, times) {
		document.getElementById("bus-line").innerText = busDestination.numLignePublic;
		document.getElementById("bus-stop").innerText = busStop;
		document.getElementById("bus-destination").innerText = busDestination.label;

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
		const times = await getTimesForLine(conf.stop, conf.destination);
		putResult(conf.stop, conf.destination, times);
	};

	try {
		await findAndShowResults();
		setInterval(findAndShowResults, 10000);
	} catch (e) {
		console.error(e);
		document.getElementById("error").innerHTML = `<p>T'as pas de réseau bolosse</p><pre>${e}</pre>`;
	}
});
