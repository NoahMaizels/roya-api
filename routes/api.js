const express = require('express')
const app = express.Router()
const chainData = require('../utils/getChainData')
  
app.get("/roya-mining", (req, res) => {
  res.json(req.chainData.tokenData.royaMining)
}) 
 

app.get("/roya-operational", (req, res) => {
  res.json(req.chainData.tokenData.royaOperational)
}) 
 

app.get("/roya-advisor", (req, res) => {
  res.json(req.chainData.tokenData.royaAdvisor)
}) 
 

app.get("/april-vesting", (req, res) => {
  res.json(req.chainData.tokenData.aprilVesting)
}) 
 

app.get("/july-vesting", (req, res) => {
  res.json(req.chainData.tokenData.julyVesting)
}) 
 

app.get("/october-vesting", (req, res) => {
  res.json(req.chainData.tokenData.octoberVesting)
}) 


app.get("/total-supply", (req, res) => {
  res.json(req.chainData.tokenData.totalSupply)
}) 

app.get("/roya-circulating", (req, res) => {
  res.json(req.chainData.tokenData.royaCirculating)
}) 

app.get("/roya-team", (req, res) => {
  res.json(req.chainData.tokenData.royaTeam)
}) 

app.get('/', (req, res) => {
  res.json(req.chainData.tokenData)
})

module.exports = app