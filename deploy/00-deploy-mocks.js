/*We only deploy mocks sometimes.We do not need to deploy mocks mocks to sepolia, 
polyhon or ethereum mainnet,
because those already have the price feeds.
we are actually going to deploy our own mock price feed contracts.
And our deploy fundMe script, we are gonna use our own contract
instead of already established contract.
If we are on a network that does not have any price feed contracts,
like hardhat or localhost.*/
const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!!")
        log("----------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
