// All external modules are loaded in:
const express = require("express")
const app = express()
const path = require("path")
const fs = require("fs")
const cors = require("cors")
const upload = require("express-fileupload")


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

// Reading input from terminal start
const port = parseInt(process.argv[2])
console.log(`${port} registered as server port`)
// Reading input from terminal end

app.use(cors()) // Making sure the browser can request more data after it is loaded on the client computer.
app.use(upload()) // Fileupload system
app.use(express.urlencoded({extended:false}))

app.use("/code", express.static("code"))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/html/fileUpload.html"))
})

app.post("/codeUpload", (req, res) => {
    const file = req.files.code
    const filePath = path.join(__dirname, `/code/uploaded/${req.body.fileName}.lua`)

    file.mv(filePath, (err) => {
        if (err) {
            res.send(err)
        }
        else {
            res.send(`Saved ${req.body.fileName} at path : `)
            console.log(file)
        }
    })
})



app.listen(port, () => console.log(`Listening on ${port}`))