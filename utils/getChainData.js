const schedule = require("node-schedule")
const numeral = require("numeral")
const Web3 = require("web3")
const db = require("./db")
const addresses = require("./addresses")
const getPriceData = require("./getPriceData")
const royaAbi = require("../abi/royaAbi.json")

 
const setupWeb3 = async () => {
  const web3 = await new Web3(new Web3.providers.WebsocketProvider(process.env.INFURA_URL))
  return web3
}

// Set number formatting default
numeral.defaultFormat("0,0.00");

// For converting to proper number of decimals
const convert = (num, decimal) => {
  return Math.round((num / (10*10**(decimal-3))))/100
}

// Set up chain data object
const chainData = {}


const getData = async (web3) => {

  const blockNumber = await web3.eth.getBlockNumber()

  // Instantiate all smart contract object(s)
  let roya = new web3.eth.Contract(royaAbi, addresses.roya)

  // Make tokenData object

  let tokenData = {
    royaMining: {},
    royaOperational: {},
    royaTeam: {},
    royaAdvisor: {},
    aprilVesting: {},
    julyVesting: {},
    octoberVesting: {},
    totalSupply: {},
    royaCirculating: {},
  }
  
  // Get base values 
  tokenData.royaMining.value = await roya.methods.balanceOf(addresses.royaMining).call() 
  tokenData.royaOperational.value  = await roya.methods.balanceOf(addresses.royaOperational).call() 
  tokenData.royaTeam.value  = await roya.methods.balanceOf(addresses.royaTeam).call() 
  tokenData.royaAdvisor.value  = await roya.methods.balanceOf(addresses.royaAdvisor).call() 
  tokenData.aprilVesting.value = await roya.methods.balanceOf(addresses.aprilVesting).call() 
  tokenData.julyVesting.value  = await roya.methods.balanceOf(addresses.julyVesting).call() 
  tokenData.octoberVesting.value  = await roya.methods.balanceOf(addresses.octoberVesting).call() 


  // Get derived values
  tokenData.totalSupply.value  = await roya.methods.totalSupply().call()
  tokenData.royaCirculating.value  = tokenData.totalSupply.value - tokenData.royaMining.value  - tokenData.royaOperational.value  - tokenData.royaTeam.value - tokenData.royaAdvisor.value - tokenData.octoberVesting.value - tokenData.aprilVesting.value - tokenData.julyVesting.value
 
  // Set up descriptions
  tokenData.royaCirculating.description = "Circulating supply of ROYA minus operational, team, advisors, and mining tokens."
  tokenData.royaTeam.description = "Royale.finance team tokens."
  tokenData.totalSupply.description = "ROYA token total supply."
  tokenData.royaMining.description = "ROYA tokens reserved for liquidity mining rewards."
  tokenData.royaOperational.description = "ROYA tokens reserved for operations."
  tokenData.royaAdvisor.description = "ROYA tokens reserved for project advisors."
  tokenData.aprilVesting.description = "Token bucket for ROYA tokens which will be vested out from January 2021 to April 2021."
  tokenData.julyVesting.description = "Token bucket for ROYA tokens which will be vested out from April 2021 to July 2021."
  tokenData.octoberVesting.description = "Token bucket for ROYA tokens which will be vested out from July 2021 to October 2021."
   
  // Set converted and formatted value, block, and timestamp
  Object.keys(tokenData).forEach(key => {
    tokenData[key].value = convert(tokenData[key].value, 18)
    tokenData[key].formattedValue = numeral(tokenData[key].value).format()
    tokenData[key].block = blockNumber
    tokenData[key].timestamp = Date.now()
  })
  
  // Set price, block, and timestamp for tokenData
  const priceData = await getPriceData()
  chainData.roya_price_usd = priceData.data.royale.usd
  chainData.block = blockNumber
  chainData.timestamp = Date.now()
  chainData.tokenData = tokenData
  
  try {
    const client = db.getClient()
    console.log(chainData)
    db.updateChainData(chainData, client) 
  }
  catch(err) {
    console.log(err)
  }
  return chainData
}
 
const updateData = async (web3) => {
  schedule.scheduleJob("0,15,30,45,59 * * * * *", async () => {    
    let newtokenData = getData(web3)
  })
}

setupWeb3().then(web3 => updateData(web3))

module.exports = chainData