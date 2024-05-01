// import
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
// in hardhat-deploy, we do not have main function and also do not call main function
// When we run hardhat-deploy, it is gonna call the function that we specified in this script

/* Way 1
async function deployFunc() {
    console.log("Hi!")
    hre.getNamedAccounts()
    hre.deployments()
}

module.exports.default = deployFunc
*/

//hre : Hardhat Runtime Environment

/* Way 2
module.exports = async (hre) => {
    Explanation of line below: pull these two variables out of hre
    Same thing -> hre.getNamedAccount and hre.deployments
    const { getNamedAccounts, deployments } = hre
}
*/

//Way 3
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use address Y
    // if chainId is Z use address A

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // if the contract doesn't exist, we deploy a minimal version of
    // for our local testing

    // well what happens when we want to change chains?
    // when going for localhost or hardhat network we want to use a mock

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [
            ethUsdPriceFeedAddress,
            /* address */
        ], //put price feed address
        log: true,
    })
    log("-----------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
