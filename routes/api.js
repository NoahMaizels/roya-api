const express = require('express')
const app = express.Router()
 

app.get("/roya-circulating", (req, res) => {
  res.json(req.chainData.royaCirculating)
}) 

app.get('/', (req, res) => {
  res.json(req.chainData)
})

module.exports = app