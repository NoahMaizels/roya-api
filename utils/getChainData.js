const schedule = require("node-schedule")
// const CoinGecko = require("coingecko-api");
const numeral = require("numeral")
const Web3 = require("web3")
const db = require("./db")
const royaAbi = require("../abi/royaAbi.json")

 
const setupWeb3 = async () => {
  const eth_web3 = await new Web3(new Web3.providers.WebsocketProvider(process.env.INFURA_URL))
  return {eth_web3}
}

//Define all ETH addresses

const addresses = {
  roya: "0x7eaf9c89037e4814dc0d9952ac7f888c784548db",
  royaMining: "0x390b47f521917888b6e487f6b6b078628472f5a4",
  royaOperational: "0x919ba21d00d2d4f68718d90db19b53d625cd50fe",
  royaTeam: "0xcb503bc3538003b3a94c906e580bb3d6cf0b45e3",
  royaAdvisor: "0xcddc3f73f15e0b1e60025e3d3eb435a72af43991"
}

// Set number formatting default
numeral.defaultFormat("0,0.00");

// For converting to proper number of decimals
const convertNum = (num, decimal) => {
  return Math.round((num / (10*10**(decimal-3))))/100
}

// Set up chain data object
const chainData = {}


const getData = async (web3s) => {
  const {eth_web3 } = web3s
  const currentEthBlockNumber = await eth_web3.eth.getBlockNumber()

  //Instantiate all token smart contract objects
  let roya = new eth_web3.eth.Contract(royaAbi, addresses.roya)
   


  let royaMining = await roya.methods.balanceOf(addresses.royaMining).call() 
  let royaOperational = await roya.methods.balanceOf(addresses.royaOperational).call() 
  let royaTeam = await roya.methods.balanceOf(addresses.royaTeam).call() 
  let royaAdvisor = await roya.methods.balanceOf(addresses.royaAdvisor).call() 


  let royaCirculating = await roya.methods.totalSupply().call()
  royaCirculating = royaCirculating - royaMining - royaOperational - royaTeam - royaAdvisor



  

  let rawNumbers = {
    royaCirculating,
  }

  let itemInfo = {
    royaCirculating: {  name: "royaCirculating", description: "Circulating supply of ROYA minus operational, team, advisors, and mining tokens."}, 
  }

  // Set cases for different decimals 
  Object.keys(rawNumbers).forEach(key => {
    const name = itemInfo[key].name
    let decimals  = 18
    const description = itemInfo[key].description
    const value = convertNum(rawNumbers[key], decimals)
    const formattedValue = numeral(value).format()
    chainData[key] = { 
      name: name, 
      description: description, 
      value: value, 
      formattedValue: formattedValue, 
      blockEth: currentEthBlockNumber, 
      timeStamp: Date()}
  })
  chainData.blockEth = currentEthBlockNumber


  // Raw & Decimals
  chainData.timeStamp = Date.now()

  // Add prices

  // Get price data

// const CoinGeckoClient = new CoinGecko();


// const getPriceData = async () => {
//   let priceData = await CoinGeckoClient.simple.price({
//     ids: ["usd-coin", "wanchain", "finnexus"],
//     vs_currencies: ["usd"],
//   });
//   return priceData
// }
// await getPriceData()

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
 
const updateData = async (web3s) => {
  // update: The settlement robot calls this function daily to update the capital pool and settle the pending refund.
  schedule.scheduleJob("0,15,30,45,59 * * * * *", async () => {    
    let newChainData = getData(web3s)
  })
}

setupWeb3().then(web3s => updateData(web3s))

module.exports = chainData