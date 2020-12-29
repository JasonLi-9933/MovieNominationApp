//jshint esversion:9
const KEY = 'ca9f0515';
const baseURL = "http://www.omdbapi.com/";
const $ = document.querySelector.bind(document);
const searchBar = $(".search-bar");
const movieListBox = $("#movie-list");
const nomineeListBox = $('#nomination-list-box');
const banner = $("#banner");

var resultList = [];
var nomineeList = [];
var nodePairs = {};


window.onload = () => {
    loadData();
    searchBar.addEventListener("change", async (e) => {
        const title = e.target.value;
        const data = await fetchMovieInfo(title);
        console.log(data);
        if (data == null) alert("No such movie is found!");
        else {
            createMovieCard(data);
        }
    });
    // localStorage.clear(); 
};

async function fetchMovieInfo(title) {
    const url = baseURL + '?' + `apikey=${KEY}` + `&t=${title}`;
    const res = await fetch(url);
    const movieInfo = await res.json();
    if (movieInfo.Response == 'False') {
        console.log("???");
        return null;
    } else {
        return movieInfo;
    }
}

function createMovieCard(data) {
    const postSrc = data.Poster;
    const movieTitle = data.Title;
    const year = data.Year;
    const rating = data.imdbRating;
    const id = data.imdbID;

    const card = document.createElement('div');
    card.className = "info-card";

    card.innerHTML = `
    <img src=${postSrc} alt="N/A" class="movie-post">
    <div class="movie-info">
        <p>Title: ${movieTitle}</p>
        <p>Year: ${year}</p>
        <p>IMDB Rating: ${rating}</p>
    </div>
    <label class="add-btn">
        <input type="checkbox">
        <span>Nominate</span>
    </label>  
    `;

    movieListBox.appendChild(card);
    // console.log(card);
    nodePairs[id] = card;
    // console.log(nodePairs);
    localStorage.setItem("nodePairs", JSON.stringify(nodePairs));
    storeSearchResult(data);

    const addBtn = card.querySelector(".add-btn input");
    addBtn.addEventListener("click", () => {
        addBtn.disabled = true;
        addBtn.parentNode.classList.add("disable");
        createNomineeCard(data);
        displayBanner();
    });
}


function createNomineeCard(data) {
    const postSrc = data.Poster;
    const movieTitle = data.Title;
    const id = data.imdbID;

    const card = document.createElement('div');
    card.className = "nominee-card";

    card.innerHTML = `
    <img src=${postSrc} alt="N/A" class="movie-post">
    <p>Title: ${movieTitle}</p>
    <label class="rmv-btn">
        <input type="checkbox" value=${id}>
        <span>Remove</span>
    </label>  
    `;

    nomineeListBox.appendChild(card);
    storeNomineeList(data);
    const rmvBtn = card.querySelector(".rmv-btn input");
    rmvBtn.addEventListener("change", (e) => {
        const targetMovieID = rmvBtn.value;
        const targetNode = nodePairs[targetMovieID].querySelector(".add-btn");
        // console.log(rmvBtn.parentNode.parentNode.isSameNode(nomineeListBox));
        const nomineeCardNode = rmvBtn.parentNode.parentNode;
        nomineeCardNode.classList.add('removed');
        setTimeout(() => {
            nomineeListBox.removeChild(nomineeCardNode);
        }, 300);
        targetNode.querySelector("input").disabled = false;
        targetNode.classList.remove("disable");
        updateNomineeList(targetMovieID);
        displayBanner();
    });
}

function storeSearchResult(data) {
    const noDuplicate = resultList.indexOf(data) == -1 || resultList.length == 0;
    if (noDuplicate) {
        resultList.push(data);
        localStorage.setItem("historyList", JSON.stringify(resultList));
    }
}

function storeNomineeList(data) {
    const noDuplicate = nomineeList.indexOf(data) == -1 || nomineeList.length == 0;
    if (noDuplicate) {
        nomineeList.push(data);
        localStorage.setItem("nomineeList", JSON.stringify(nomineeList));
    }
}

function updateNomineeList(id) {
    console.log(nomineeList);
    nomineeList = nomineeList.filter(d => {
        return d.imdbID != id;
    });
    console.log(nomineeList);
    localStorage.setItem("nomineeList", JSON.stringify(nomineeList));
}

// load the data from previous session and render the page
function loadData() {
    resultList = JSON.parse(localStorage.getItem("historyList"));
    nomineeList = JSON.parse(localStorage.getItem("nomineeList"));
    nodePairs = JSON.parse(localStorage.getItem("nodePairs"));
    console.log(nomineeList);
    if (resultList == null) resultList = [];
    if (nomineeList == null) nomineeList = [];
    if (nodePairs == null) nodePairs = {};
    populateUI();
}

function populateUI() {

    if (resultList != null) {
        resultList.forEach((data) => {
            createMovieCard(data);
        });
    }

    if (nomineeList != null) {
        nomineeList.forEach((data) => {
            createNomineeCard(data);
            const targetNode = nodePairs[data.imdbID];
            targetNode.querySelector('.add-btn input').disabled = true;
            targetNode.querySelector('.add-btn').classList.add("disable");
        });
        displayBanner();
    }
}

// render the banner based on the number of nominee movie
function displayBanner() {
    if (nomineeList.length >= 5) {
        banner.className = "";
    } else {
        banner.classList.add("removed");
    }
}