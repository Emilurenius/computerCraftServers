// All external modules are loaded in:
const express = require("express")
const app = express()
const path = require("path")
const fs = require("fs")
const cors = require("cors")
const bcrypt = require("bcrypt")

const SpotifyWebAPI = require('spotify-web-api-node');
scopes = ["user-read-playback-state", "user-modify-playback-state"]

function loadJSON(filename) {
    const rawdata = fs.readFileSync(path.join(__dirname, filename))
    const data = JSON.parse(rawdata)
    return data
}

function saveJSON(json, filename) {
    const stringified = JSON.stringify(json, null, 4)
    fs.writeFile(path.join(__dirname, filename), stringified, (err) => {
        if (err) throw err
        console.log("Data written to file")
    })
}

function refreshAccessToken(selectedAPI) {
    selectedAPI.refreshAccessToken().then(
        (data) => { 
            console.log("Access token refreshed")

            selectedAPI.setAccessToken(data.body["access_token"])
        },
        (err) => {
            console.log("Could not refresh access token", err)
        }
    )
}

fs.open('./clientPasses.json', 'wx', (err, fd) => { // Create the file clientPasses if it doesn't yet exist
    if (err) {
        if (err.code === 'EEXIST') {
            console.error('clientPasses.json already exists');
            return;
        }
    }
    else {
        const fileContent = {}
        saveJSON(fileContent, "/clientPasses.json")
        console.log("clientPasses.json not found. File generated")
    }
})

let spotifyClients = {}

const clientData = loadJSON("/spotifyClientData.json")
console.log(clientData)

// Reading input from terminal start
const port = parseInt(process.argv[2])
console.log(`${port} registered as server port`)
// Reading input from terminal end

app.use(cors()) // Making sure the browser can request more data after it is loaded on the client computer.

app.get("/", (req, res) => {
    if (req.query.user && req.query.pass) {
        let clientPasses = loadJSON("/clientPasses.json")
        if (clientPasses[req.query.user]) {
            const clientPasses = loadJSON("/clientPasses.json")

            res.redirect(`/spotify/login?user=${req.query.user}&pass=${req.query.pass}`)
        }
        else {
            bcrypt.hash(req.query.pass, 10).then((hash) => {
                const hashedPass = hash
                console.log(hashedPass)
                clientPasses[req.query.user] = hashedPass
                console.log(clientPasses)
                res.send(clientPasses)
                saveJSON(clientPasses, "/clientPasses.json")
            })
        }
    }
    else {
        res.sendFile(path.join(__dirname, "/html/index.html"))
    }
})

app.get("/spotify/login", (req, res) => {
    const clientPasses = loadJSON("/clientPasses.json")

    bcrypt.compare(req.query.pass, clientPasses[req.query.user], (err, result) => {
        if (err) {
            console.log(err)
            res.send(err)
        }
        else if (result) {
            spotifyClients[req.query.name] = new SpotifyWebAPI({
                clientId: clientData.clientID,
                clientSecret: clientData.clientSecret,
                redirectUri: clientData.loginRedirect
            })
            console.log(spotifyClients[req.query.name])
            const loginPage = spotifyClients[req.query.name].createAuthorizeURL(scopes)
            res.redirect(loginPage)
            console.log("Login initiated")
        }
        else {
            res.send("Not authorized")
        }
    })
})

app.get("/spotify/login/success", async (req, res) => {

    try {
        const data = await spotifyClients[req.query.user].authorizationCodeGrant(req.query.code)
        const { access_token, refresh_token } = data.body
        spotifyClients[req.query.user].setAccessToken(access_token)
        spotifyClients[req.query.user].setRefreshToken(refresh_token)

        // res.send(`Logged in! ${access_token} ${refresh_token}`)
        res.send("Logged in")
        console.log(`Logged in!\n${access_token}\n${refresh_token}`)
    } catch (err) {
        res.send("Login failed")
        console.log("Login failed")
    }
})


app.listen(port, () => console.log(`Listening on ${port}`))