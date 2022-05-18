var Web3 = require("web3");

/* todo: 1. deposit busd and get ibusd : yet to find the contract address and abi
          2. use the ibusd and call deposit function on the fair launch contract to get allocated alpaca
          3. wait for alpaca token to be available
          4. transfer alpaca token to pancakeswap ang get busd
*/

var web3 = new Web3("HTTP://127.0.0.1:8545");

var iBusdAddress = "0x7C9e73d4C71dae564d41F78d56439bB4ba87592f";
var AlpacaAddress = "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F";
var fairLaunchAddress = "0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F";
var BUSDaddress = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
var strategyAddress = "0xB885aF37aDb11e200747Ae9E8f693d0E44751c09";
var PancakeRouteraddress = "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F";

//this address has lots of busd
var unlockedAddress = "0x631fc1ea2270e98fbd9d92658ece0f5a269aa161";

var pancakeRouterAbi = require("./abi/PancakeSwapRouterAbi.json");
var strategyAbi = require("./abi/strategy.json");
var busdAbi = require("./abi/busd.json");

var account1;
var account2;

var Amount = web3.utils.toWei("10");

let PancakeRouter;
let Strategy;
let BUSDContract;

async function run() {
  //pancakse router contract instance
  PancakeRouter = new web3.eth.Contract(pancakeRouterAbi, PancakeRouteraddress);

  //strategy contract instance
  Strategy = new web3.eth.Contract(strategyAbi.abi, strategyAddress);

  BUSDContract = new web3.eth.Contract(busdAbi, BUSDaddress);

  // busd contract instance

  // initialize web3 accounts
  let accounts = await web3.eth.getAccounts()
    account1 = accounts[0];
    account2 = accounts[1];

    await BUSDContract.methods.transfer(account1, Amount).send({ from: unlockedAddress });

  let recipientBalance = await BUSDContract.methods.balanceOf(account1).call();

  console.log(`Recipient: ${account1} Busd Balance: ${recipientBalance}`);

  //approve pancake swap to take 10 busd
  await BUSDContract.methods.approve(PancakeRouteraddress, Amount).send({ from: account1 });

  console.log(
    `Address ${PancakeRouteraddress}  has been approved to spend ${Amount} x 10^-18 Busd by Owner:  ${account1}`
  );

  

  let blockData = await web3.eth.getBlock("pending");

  //The following line is an example of cube data declarations. Each one is a call of a function which is in the pancakeRouter contract with the respective parameters
  var data1 = PancakeRouter.methods
    .swapExactTokensForTokens(
      Amount,
      0,
      [BUSDaddress, BDOaddress],
      strategyAddress,
      blockData.timestamp + 10
    )
    .encodeABI();
  var data2 = PancakeRouter.methods
    .swapExactTokensForTokens(
      Amount,
      0,
      [BUSDaddress, WBNBaddress],
      strategyAddress,
      blockData.timestamp + 10
    )
    .encodeABI();

  var addCubes = await Strategy.methods
    .addCubes([PancakeRouteraddress, PancakeRouteraddress], [data1, data2], 0)
    .send({ from: account1 });

  console.log(addCubes, "add cubes data");
}

run();
