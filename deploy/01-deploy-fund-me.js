// import
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
}
