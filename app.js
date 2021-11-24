"use strict";

document.addEventListener("DOMContentLoaded", async function (_e) {
  document.onresize = () => {
    document.body.style.height = window.innerHeight + "px";
  };

  document.onresize(null);

  const url =
    "https://api.ginko.voyage/TR/getTempsLieu.do?idArret=CEPARGN2&nb=3";

  try {
    const response = await fetch(
      "https://api.ginko.voyage/TR/getTempsLieu.do?idArret=CEPARGN2&nb=3"
    );

    const body = await response.json();

    /** @type {string[]} times */
    const times = body.objets.listeTemps.map((o) => o.temps);

    document.getElementById("next").innerText = times.shift();

    document.getElementById("others").innerHTML = times
      .map((time) => `<li>${time}</li>`)
      .join("");
  } catch (e) {
    document.getElementById("error").innerText = "T'as pas de réseau bolosse";
  }
});
