const express = require('express');
const app = express();
const utf8 = require('utf8');
const fetch = require("node-fetch");
const API_KEY = "" // YOUR API KEY;
const EUW = "https://euw1.api.riotgames.com";
const champData = require('./data/champion.json');
const summonerData = require('./data/summoner');
const runes = require('./data/runes');



//Server hört auf Anfragen an Port 3000 / Server is listening on Port 3000
app.listen(3000, () => console.log('Listening on Port 3000'));

app.use(express.json());

// Request Spectator API
app.post('/api/currentmatch', (request, response) => {


    console.log(request.body.name);
    const summonerName = request.body.name;
    const summonerByName = "/lol/summoner/v4/summoners/by-name/";
    const summonerById = "/lol/summoner/v4/summoners/";
    const spectator = "/lol/spectator/v4/active-games/by-summoner/";
    let finalInfo;

    getSummonerId().then(answer => {
        finalInfo = answer;
        console.log(finalInfo);
        response.send(finalInfo);
    });

    async function getSummonerId() {
        let gameInfo = [];
        let response = await fetch(EUW + summonerByName + summonerName + API_KEY);
        let json = await response.json();
        let encryptedSummonerId = await json.id;
        let response2 = await fetch(
            EUW + spectator + encryptedSummonerId + API_KEY
        );
        let json2 = await response2.json();
        let participants = await json2.participants;

        for (players in participants) {

            let counter = 1;
            let response = await fetch(
                EUW + summonerById + participants[players]["summonerId"] + API_KEY
            );
            let json = await response.json();
            let summonerLevel = await json["summonerLevel"];
            let champion,
                image,
                spell1,
                spell2,
                perks = [];

            for (elements in champData.data) {
                if (
                    participants[players]["championId"] == champData.data[elements]["key"]
                ) {
                    champion = champData.data[elements]["name"];
                    image = champData.data[elements]["image"]["full"];
                }
            }

            for (elements in summonerData.data) {
                if (
                    participants[players]["spell1Id"] ==
                    summonerData.data[elements]["key"]
                ) {
                    spell1 = summonerData.data[elements]["image"]["full"];
                } else if (
                    participants[players]["spell2Id"] ==
                    summonerData.data[elements]["key"]
                ) {
                    spell2 = summonerData.data[elements]["image"]["full"];
                }
            }

            for (elements in runes) {
                for (value in runes[elements]["slots"]) {
                    for (final in runes[elements]["slots"][value]["runes"])
                        for (ids in participants[players]["perks"]["perkIds"]) {
                            if (
                                runes[elements]["slots"][value]["runes"][final]["id"] ==
                                participants[players]["perks"]["perkIds"][ids]
                            ) {
                                perks.push(
                                    "http://ddragon.leagueoflegends.com/cdn/img/" +
                                    runes[elements]["slots"][value]["runes"][final]["icon"]
                                );
                            }
                        }
                }
            }

            let counterName = 'summoner' + counter.toString();

            let playerInfo = {
                name: participants[players]["summonerName"],
                champ: champion,
                team: participants[players]["teamId"],
                spell1Img: "http://ddragon.leagueoflegends.com/cdn/10.6.1/img/spell/" + spell1,
                spell2Img: "http://ddragon.leagueoflegends.com/cdn/10.6.1/img/spell/" + spell2,
                perks: perks, //participants[players]['perks']['perkIds']
                level: summonerLevel,
                imageURL: "http://ddragon.leagueoflegends.com/cdn/10.6.1/img/champion/" + image
            };
            gameInfo.push(playerInfo);
            counter++;
        }

        return gameInfo;
    }
});

//Request Matchlist API
app.post('/api/allmatches', (request, response) => {
    // /lol/match/v4/matchlists/by-account/{encryptedAccountId}

    let encryptedAccountId = request.body.encryptedAccountId;
    let matchURL = '/lol/match/v4/matchlists/by-account/';

    fetchData().then(result => response.send(result)).catch(err => response.send(err));

    async function fetchData() {

        let response = await fetch(EUW + matchURL + encryptedAccountId + API_KEY);
        let json = await response.json();
        return json;
    }

});


// Request Match API
app.post('/api/match', (request, response) => {
    // /lol/match/v4/matches/{matchId}

    let matchId = request.body.matchId;
    let matchURL = '/lol/match/v4/matches/'

    fetchData().then(result => response.send(result)).catch(err => response.send(err));

    async function fetchData() {

        let response = await fetch(EUW + matchURL + matchId + API_KEY);
        let json = await response.json();
        return json;

    }

});


// Request Match-Timeline API
app.post('/api/matchtimeline', (request, response) => {
    // /lol/match/v4/timelines/by-match/{matchId}

    let matchId = request.body.matchId;
    let matchURL = '/lol/match/v4/timelines/by-match/';

    fetchData().then(result => response.send(result)).catch(err => response.send(err));

    async function fetchData() {

        let response = await fetch(EUW + matchURL + matchId + API_KEY);
        let json = await response.json();
        return json;


    }

});


/*

Queries coming soon

QUERIES
alle benötigen {matchId}


Matchlist by Champion 
Matchlist by Queue
Matchlist by Season
Matchlist by timeline (begin and End)
Matchlist by Index (50 out of 100 and so on)

*/
