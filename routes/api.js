const express = require('express')
const app = express.Router()
const chainData = require('../utils/getChainData')
  
app.get("/roya-mining", (req, res) => {
  res.json(req.chainData.royaMining)
}) 
 

app.get("/roya-operational", (req, res) => {
  res.json(req.chainData.royaOperational)
}) 
 

app.get("/roya-advisor", (req, res) => {
  res.json(req.chainData.royaAdvisor)
}) 
 

app.get("/april-vesting", (req, res) => {
  res.json(req.chainData.aprilVesting)
}) 
 

app.get("/july-vesting", (req, res) => {
  res.json(req.chainData.julyVesting)
}) 
 

app.get("/october-vesting", (req, res) => {
  res.json(req.chainData.octoberVesting)
}) 


app.get("/total-supply", (req, res) => {
  res.json(req.chainData.totalSupply)
}) 

app.get("/roya-circulating", (req, res) => {
  res.json(req.chainData.royaCirculating)
}) 

app.get("/roya-team", (req, res) => {
  res.json(req.chainData.royaTeam)
}) 

app.get('/', (req, res) => {
  res.json(req.chainData)
})

module.exports = app