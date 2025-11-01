"use strict";
const constituencyAndList = [ // Array for each region
  {
    region: "Central Scotland",
    constSeats: [9, 0, 0, 0, 0, 0], //Constituency seats won by each party in the order SNP, Alba, Green, Labour, Conservative and Liberal democrats
    listVotes: [148399, 5345, 19512, 77623, 59896, 6337] //regional list votes in the same order as constituency seats
  },
  {
    region: "Glasgow",
    constSeats: [9, 0, 0, 0, 0, 0],
    listVotes: [133917, 7820, 36114, 74088, 37027, 6079]
  },
  {
    region: "Highlands and Islands",
    constSeats: [6, 0, 0, 0, 0, 2],
    listVotes: [96433, 3828, 17729, 22713, 60779, 26771]
  },
  {
    region: "Lothian",
    constSeats: [7, 0, 0, 1, 0, 1],
    listVotes: [141478, 14973, 49984, 76689, 78595, 28433]
  },
  {
    region: "Mid Scotland and Fife",
    constSeats: [8, 0, 0, 0, 0, 1],
    listVotes: [136825, 7064, 28654, 52626, 85909, 25489]
  },
  {
    region: "North East Scotland",
    constSeats: [9, 0, 0, 0, 1, 0],
    listVotes: [147910, 8269, 22735, 41062, 110555, 18051]
  },
  {
    region: "South Scotland",
    constSeats: [6, 0, 0, 0, 3, 0],
    listVotes: [136741, 8572, 18964, 57236, 121730, 12422]
  },
  {
    region: "West Scotland",
    constSeats: [8, 0, 0, 1, 1, 0],
    listVotes: [152671, 10914, 26632, 83782, 82640, 13570]
  }
];
const parties = ["SNP", "Alba", "Green", "Labour", "Cons", "Libdem"];
let partiesCells = "";
for (const partyName of parties) {
  partiesCells += `<th>${partyName}</th>`; // make a line of cells with party names in each cell
}
let regionInx;
let partyInx;
let workingListVotes = [];
for (regionInx = 0; regionInx < constituencyAndList.length; regionInx++) {
  workingListVotes.push([0, 0, 0, 0, 0, 0]);
}

function createVoteTable(voteArray, seatsVotes){ //Create a table to display votes per region
  let txt = `<tr><th>Region</th>${partiesCells}</tr>`;
    //let txt="<tr><th>Region</th><th>SNP</th><th>Alba</th><th>Green</th><th>Labour</th><th>Cons</th><th>Libdem</th></tr>"; // Headings for first row
  for (const region of voteArray) { // for each region...
    txt +=`<tr><td>${region["region"]}</td>`; // Make a table entry for the name of the region
    for (const voteList of region[seatsVotes]) { // for each party...
      txt += `<td>${voteList}</td>`; // make table row entries for their votes or seat
    }
    txt +="</tr>" // Complete the row
  }
  return txt;
}
// =========================display the constituency seats and regional list votes ================================
document.getElementById("const-seats").innerHTML = createVoteTable(constituencyAndList, "constSeats"); // display constituency results

document.getElementById("list-seats").innerHTML = createVoteTable(constituencyAndList, "listVotes"); // display regional list votes
// D'Hondt section=================================================================
//===================================================================================
const listSeatsWon = [0, 0, 0, 0, 0, 0];
const line3Desc = "List seats won so far";
let currentRound = [7, 7, 7, 7, 7, 7, 7, 7];
let currentRegion = -1;
regionUp();
let currentDataset = -1;
changeDatasetUp();

function dHondtReset() { // beginning and reset position of variables to be displayed and controlling variables (which round we're on)
  currentRound[currentRegion] = 0;
  let tableLine1 = `<th>${constituencyAndList[currentRegion].region}</th>${partiesCells}</th><th>Winner of round</th>`; //table headings
  document.getElementById("table3-headings").innerHTML = tableLine1;
  let tableLine2 = "<td>Constituency Seats</td>"; //set up content of table for D'Hondt demonstration
  for (const i of constituencyAndList[currentRegion].constSeats) {
    tableLine2 += `<td>${i}</td>`;// set up table data entries for constituency results
  }
  tableLine2 += "<td></td>";
  document.getElementById("const-won").innerHTML = tableLine2; // fixed content so this can be inserted into the table just once
  for (const listArray in listSeatsWon) { // zero out all the regional list
    listSeatsWon[listArray] = 0;
  }

  let tableLine3 = `<td>${line3Desc}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td></td>` // reset list seats won to all zeros
  document.getElementById("list-won").innerHTML = tableLine3; // append list seats line to table
  let tableLine4 = "<td>List votes cast</td>"; // start constructing 4th line of the table
  for (const k of workingListVotes[currentRegion]) {
    tableLine4 += `<td>${k}</td>`; // add each cell to the table row
  }
  tableLine4 += "<td></td>"; // append an empty cell so that the border works properly
  document.getElementById("votes-cast").innerHTML = tableLine4; // insert row 4 which is fixed and doesn't have to be worried about any more

  for (let j=1; j<=7; j++) {
    document.getElementById(`round${j}`).innerHTML =
    `<td>-</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`; // clear rounds lines
  }
  document.getElementById("round-btn").innerHTML = "Start"; // set button text for start of D'Hondt run
}

const dHondt = document.getElementById("round-btn"); // set up listener for Start/Next round/Restart button
dHondt.addEventListener("click", nextDHondtRound);
const regionLeft = document.getElementById("region-left"); // set up event listener for region button
regionLeft.addEventListener("click", regionDown);
const regionRight = document.getElementById("region-right");
regionRight.addEventListener("click", regionUp);
const datasetLeft = document.getElementById("dataset-left"); // event listener for data set button
datasetLeft.addEventListener("click", changeDatasetDown);
const datasetRight = document.getElementById("dataset-right"); // event listener for data set button
datasetRight.addEventListener("click", changeDatasetUp);

redisplayRounds();

function nextDHondtRound() {
  currentRound[currentRegion]++;
  let dHontArray;
  let party;
  let text = `<td>Round ${currentRound[currentRegion]}</td>` // start setting up table row for D'Hondt round
  if (currentRound[currentRegion] === 8) {
    dHondtReset();
  } else {
    dHontArray = workingListVotes[currentRegion].map(function(votes, inx){
      return Math.round(votes/(constituencyAndList[currentRegion].constSeats[inx]+listSeatsWon[inx]+1)); // apply the D'Hondt formula to all the party votes
    });
    let max = dHontArray[0];
    let maxInx = 0;
    for (party in dHontArray) {
      if (dHontArray[party] >max) {
        max = dHontArray[party]; // Find the winning party
        maxInx = party; // and save the index
      }
    };
    for (party of dHontArray) {
      text += `<td>${party}</td>` // collect D'Hondt results into a string
    }
    text += `<td style="text-align: left">${parties[maxInx]}</td>` // override style to make winning party string left aligned
    document.getElementById(`round${currentRound[currentRegion]}`).innerHTML = text; // and append to the table
    text = `<td>${line3Desc}</td>`; // set up row for updated regional list seats
    listSeatsWon[maxInx]++; // increment regional list seats of round winner
    for (party of listSeatsWon) {
      text += `<td>${party}</td>` // collect party seats won into a string
    };
    text += "<td></td>"; // add a cell to the end of the string
    document.getElementById("list-won").innerHTML = text;
    document.getElementById("round-btn").innerHTML = (currentRound[currentRegion] === 7)? "Reset": "Next round"; // If on round 7 changes button text
  }
}

function regionUp() {
  currentRegion = (currentRegion + 1) % 8;
  changeRegion();
}

function regionDown() {
  currentRegion = (currentRegion + 7) % 8;
  changeRegion();
}
function changeRegion() {
  document.getElementById("current-region-text").innerHTML = `Current region: ${constituencyAndList[currentRegion].region}`; // change text for region button
  redisplayRounds();
}
function changeDatasetDown() {
  currentDataset = (currentDataset + 3) % 4;
  changeDataset();
}
function changeDatasetUp() {
  currentDataset = (currentDataset + 1) % 4;
  changeDataset();
}
function changeDataset() {
  let temp;
  for (regionInx = 0; regionInx < constituencyAndList.length; regionInx++) {
    for (partyInx = 0; partyInx < parties.length; partyInx++) {
      workingListVotes[regionInx][partyInx] = constituencyAndList[regionInx].listVotes[partyInx]; // copy list votes to an array that can be safely altered
    }
    switch (currentDataset) {
      case 0:
        document.getElementById("current-dataset-text").innerHTML = "Dataset: 2021 results";
        break;
      case 1:
        temp = workingListVotes[regionInx][0]/2;
        workingListVotes[regionInx][0] = 0;
        workingListVotes[regionInx][1] += Math.floor(temp);
        workingListVotes[regionInx][2] += Math.ceil(temp);
        document.getElementById("current-dataset-text").innerHTML = "Dataset: SNP -> Alba/Green 50/50";
        break;
      case 2:
        workingListVotes[regionInx][1]+= workingListVotes[regionInx][0];
        workingListVotes[regionInx][0] = 0;
        document.getElementById("current-dataset-text").innerHTML = "Dataset: SNP -> Alba";
        break;
      case 3:
        workingListVotes[regionInx][2]+= workingListVotes[regionInx][0];
        workingListVotes[regionInx][0] = 0;
        document.getElementById("current-dataset-text").innerHTML = "Dataset: SNP -> Green";
        break;
      default:
        document.getElementById("current-dataset-text").innerHTML = "Error in code";
    }
  }
  redisplayRounds();
}

function redisplayRounds() {
  let roundKeeper, round;
  roundKeeper = currentRound[currentRegion];
  dHondtReset();
  for (round = 1; round <= roundKeeper; round++) {
    nextDHondtRound();
  }
}
