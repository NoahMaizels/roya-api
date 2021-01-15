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

  // Make chainData object

  let chainData = {
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
  chainData.royaMining.value = await roya.methods.balanceOf(addresses.royaMining).call() 
  chainData.royaOperational.value  = await roya.methods.balanceOf(addresses.royaOperational).call() 
  chainData.royaTeam.value  = await roya.methods.balanceOf(addresses.royaTeam).call() 
  chainData.royaAdvisor.value  = await roya.methods.balanceOf(addresses.royaAdvisor).call() 
  chainData.aprilVesting.value = await roya.methods.balanceOf(addresses.aprilVesting).call() 
  chainData.julyVesting.value  = await roya.methods.balanceOf(addresses.julyVesting).call() 
  chainData.octoberVesting.value  = await roya.methods.balanceOf(addresses.octoberVesting).call() 


  // Get derived values
  chainData.totalSupply.value  = await roya.methods.totalSupply().call()
  chainData.royaCirculating.value  = chainData.totalSupply.value - chainData.royaMining.value  - chainData.royaOperational.value  - chainData.royaTeam.value - chainData.royaAdvisor.value - chainData.octoberVesting.value - chainData.aprilVesting.value - chainData.julyVesting.value
 
  // Set up descriptions
  chainData.royaCirculating.description = "Circulating supply of ROYA minus operational, team, advisors, and mining tokens."
  chainData.royaTeam.description = "Royale.finance team tokens."
  chainData.totalSupply.description = "ROYA token total supply."
  chainData.royaMining.description = "ROYA tokens reserved for liquidity mining rewards."
  chainData.royaOperational.description = "ROYA tokens reserved for operations."
  chainData.royaAdvisor.description = "ROYA tokens reserved for project advisors."
  chainData.aprilVesting.description = "Token bucket for ROYA tokens which will be vested out from January 2021 to April 2021."
  chainData.julyVesting.description = "Token bucket for ROYA tokens which will be vested out from April 2021 to July 2021."
  chainData.octoberVesting.description = "Token bucket for ROYA tokens which will be vested out from July 2021 to October 2021."
   
  // Set converted and formatted value, block, and timestamp
  Object.keys(chainData).forEach(key => {
    chainData[key].value = convert(chainData[key].value, 18)
    chainData[key].formattedValue = numeral(chainData[key].value).format()
    chainData[key].block = blockNumber
    chainData[key].timestamp = Date.now()
  })
  
  // Set price, block, and timestamp for chainData
  const priceData = await getPriceData()
  chainData.roya_price_usd = priceData.data.royale.usd
  chainData.block = blockNumber
  chainData.timestamp = Date.now()
  
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
    let newChainData = getData(web3)
  })
}

setupWeb3().then(web3 => updateData(web3))

module.exports = chainData