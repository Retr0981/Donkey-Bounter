const StrategyContract = artifacts.require("Strategy");

module.exports = function (deployer) { 
    deployer.then(async () => {
        await deployer.deploy(StrategyContract);

        console.log("Strategy contract address", StrategyContract.address)
    })
}