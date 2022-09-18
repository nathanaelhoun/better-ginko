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
		beginTime: 0,
		endTime: 12,
		stop: "Isenbart",
		destination: {
			numLignePublic: "L3",
			sensAller: false,
			label: "Temis",
		},
	},
	{
		beginTime: 12,
		endTime: 24,
		stop: "Crous-Université",
		destination: {
			numLignePublic: "L3",
			sensAller: true,
			label: "Centre - Ville",
		},
	},
];

/**
 * TODO DOC
 * @var {} bikeStations
 */
const bikeStations = {
	1: "Gare Viotte",
	5: "Isenbart",
	6: "Micaud",
	21: "Fontaine Argent",
};

document.addEventListener("DOMContentLoaded", async function () {
	/**
	 * @returns {configItem}
	 */
	function getConfigFromTime() {
		const today = new Date();
		const now = today.getHours() + today.getMinutes() / 100;

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
		const response = await fetch(`/api/v1/ginko/${busStop}`);

		const body = await response.json();

		const times = body.objets.listeTemps
			.filter((o) => busDestination.numLignePublic == o.numLignePublic)
			.filter((o) => busDestination.sensAller == o.sensAller)
			.map((o) => o.temps);
		return times;
	}

	/**
	 *
	 * @returns {Promise<string[]>}
	 */
	async function getAndPutBikeStationsStates() {
		const response = await fetch(`/api/v1/velocite/`);

		const body = await response.json();


		const stationsInfos = body.data.stations.filter((station) =>
			Object.keys(bikeStations).includes(station.station_id)
		);

		function formatStation(s) {
			let line = `${bikeStations[s.station_id]} : `;

			// Bikes
			line += `<span`;
			if (s.num_bikes_available < 0) {
				line += ` style="background-color: red"`;
			} else if (s.num_bikes_available < 2) {
				line += ` style="background-color: orange"`;
			}
			line += `>${s.num_bikes_available} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M312 32c-13.3 0-24 10.7-24 24s10.7 24 24 24h25.7l34.6 64H222.9l-27.4-38C191 99.7 183.7 96 176 96H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h43.7l22.1 30.7-26.6 53.1c-10-2.5-20.5-3.8-31.2-3.8C57.3 224 0 281.3 0 352s57.3 128 128 128c65.3 0 119.1-48.9 127-112h49c8.5 0 16.3-4.5 20.7-11.8l84.8-143.5 21.7 40.1C402.4 276.3 384 312 384 352c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128c-13.5 0-26.5 2.1-38.7 6L375.4 48.8C369.8 38.4 359 32 347.2 32H312zM458.6 303.7l32.3 59.7c6.3 11.7 20.9 16 32.5 9.7s16-20.9 9.7-32.5l-32.3-59.7c3.6-.6 7.4-.9 11.2-.9c39.8 0 72 32.2 72 72s-32.2 72-72 72s-72-32.2-72-72c0-18.6 7-35.5 18.6-48.3zM133.2 368h65c-7.3 32.1-36 56-70.2 56c-39.8 0-72-32.2-72-72s32.2-72 72-72c1.7 0 3.4 .1 5.1 .2l-24.2 48.5c-9 18.1 4.1 39.4 24.3 39.4zm33.7-48l50.7-101.3 72.9 101.2-.1 .1H166.8zm90.6-128H365.9L317 274.8 257.4 192z"/></svg></span>`;

			// Docs
			line += `<span`;
			if (s.num_docks_available < 0) {
				line += ` style="background-color: red"`;
			} else if (s.num_docks_available < 2) {
				line += ` style="background-color: orange"`;
			}
			line += `>${s.num_docks_available} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM192 256h48c17.7 0 32-14.3 32-32s-14.3-32-32-32H192v64zm48 64H192v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V288 168c0-22.1 17.9-40 40-40h72c53 0 96 43 96 96s-43 96-96 96z"/></svg></span>`;

			return "<li>" + line + "</li>";
		}

		document.getElementById("bikesStations").innerHTML = stationsInfos
			.map(formatStation)
			.join("");

		return document.getElementById("bikesStations").innerHTML;
	}

	/**
	 * Fills the DOM
	 *
	 * @param {string}   busStop
	 * @param {string}   busLine
	 * @param {Object[]} busDestination
	 * @param {string[]} times
	 * @returns
	 */
	function putResult(busStop, busDestination, times) {
		document.getElementById("bus-line").innerText =
			busDestination.numLignePublic;
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

		getAndPutBikeStationsStates();

		const times = await getTimesForLine(conf.stop, conf.destination);
		putResult(conf.stop, conf.destination, times);
	}

	try {
		await findAndShowResults();
		setInterval(findAndShowResults, 60 * 1000);
	} catch (e) {
		console.error(e);

		const errorDiv = document.getElementById("error");

		if (e.message.includes("NetworkError")) {
			errorDiv.innerHTML = `<p>T’as pas de réseau bolosse</p><pre>${e}</pre>`;
			return;
		}

		errorDiv.innerHTML = `<p>Erreur dans le JavaScript, dommage</p><pre>${e}</pre>`;
	}
});
