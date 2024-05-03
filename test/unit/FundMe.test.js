const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
require("hardhat-deploy")

//unit test only runs on development chain
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.parseEther("1") // 1 ETH
          beforeEach(async function () {
              // deploy our fundMe contract
              // using Hardhat deploy
              // const accounts = await ethers.getSigners()
              // const accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", async function () {
              it("Sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.target)
              })
          })
          describe("fund", async function () {
              it("Fails if you do not send enough ETH!!", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of getFunder", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
              describe("withdraw", async function () {
                  beforeEach(async function () {
                      await fundMe.fund({ value: sendValue })
                  })
                  it("withdraw ETH from a single founder", async function () {
                      //Arrange
                      const startingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.target)
                      const startingDeployerBalance =
                          await ethers.provider.getBalance(deployer)
                      //Act
                      const transactionResponse = await fundMe.withdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, gasPrice } = transactionReceipt
                      //gasCost
                      const gasCost = gasPrice * gasUsed
                      const endingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.target)
                      const endingDeployerBalance =
                          await ethers.provider.getBalance(deployer)

                      //Assert
                      assert.equal(endingFundMeBalance, 0)
                      assert.equal(
                          startingDeployerBalance + startingFundMeBalance,
                          endingDeployerBalance + gasCost
                      )
                  })
                  it("Cheaperwithdraw ETH from a single founder", async function () {
                      //Arrange
                      const startingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.target)
                      const startingDeployerBalance =
                          await ethers.provider.getBalance(deployer)
                      //Act
                      const transactionResponse = await fundMe.cheaperWithdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, gasPrice } = transactionReceipt
                      //gasCost
                      const gasCost = gasPrice * gasUsed
                      const endingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.target)
                      const endingDeployerBalance =
                          await ethers.provider.getBalance(deployer)

                      //Assert
                      assert.equal(endingFundMeBalance, 0)
                      assert.equal(
                          startingDeployerBalance + startingFundMeBalance,
                          endingDeployerBalance + gasCost
                      )
                  })
                  it("Allows us to withdraw with multiple getFunder", async function () {
                      //Arrange
                      const accounts = await ethers.getSigners()
                      for (let i = 1; i < 6; i++) {
                          const fundMeConnecttedContract = await fundMe.connect(
                              accounts[i]
                          )
                          await fundMeConnecttedContract.fund({
                              value: sendValue,
                          })
                      }
                      const startingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.target)
                      const startingDeployerBalance =
                          await ethers.provider.getBalance(deployer)

                      //Act
                      const transactionResponse = await fundMe.withdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, gasPrice } = transactionReceipt
                      //gasCost
                      const gasCost = gasPrice * gasUsed
                      const endingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.target)
                      const endingDeployerBalance =
                          await ethers.provider.getBalance(deployer)

                      //Assert
                      assert.equal(endingFundMeBalance, 0)
                      assert.equal(
                          startingDeployerBalance + startingFundMeBalance,
                          endingDeployerBalance + gasCost
                      )

                      //Make sure that the getFunder are reset properly
                      await expect(fundMe.getFunder(0)).to.be.reverted

                      for (i = 1; i < 6; i++) {
                          assert.equal(
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              ),
                              0
                          )
                      }
                  })
                  it("Only allows the owner to withdraw", async function () {
                      const accounts = await ethers.getSigners()
                      const attacker = accounts[1]
                      const attackerConnectedContract = await fundMe.connect(
                          attacker
                      )
                      await expect(
                          attackerConnectedContract.withdraw()
                      ).to.be.revertedWithCustomError(
                          attackerConnectedContract,
                          "FundMe__NotOwner"
                      )
                  })
                  it("CheaperWithdraw testing...", async function () {
                      //Arrange
                      const accounts = await ethers.getSigners()
                      for (let i = 1; i < 6; i++) {
                          const fundMeConnecttedContract = await fundMe.connect(
                              accounts[i]
                          )
                          await fundMeConnecttedContract.fund({
                              value: sendValue,
                          })
                      }
                      const startingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.target)
                      const startingDeployerBalance =
                          await ethers.provider.getBalance(deployer)

                      //Act
                      const transactionResponse = await fundMe.cheaperWithdraw()
                      const transactionReceipt = await transactionResponse.wait(
                          1
                      )
                      const { gasUsed, gasPrice } = transactionReceipt
                      //gasCost
                      const gasCost = gasPrice * gasUsed
                      const endingFundMeBalance =
                          await ethers.provider.getBalance(fundMe.target)
                      const endingDeployerBalance =
                          await ethers.provider.getBalance(deployer)

                      //Assert
                      assert.equal(endingFundMeBalance, 0)
                      assert.equal(
                          startingDeployerBalance + startingFundMeBalance,
                          endingDeployerBalance + gasCost
                      )

                      //Make sure that the getFunder are reset properly
                      await expect(fundMe.getFunder(0)).to.be.reverted

                      for (i = 1; i < 6; i++) {
                          assert.equal(
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              ),
                              0
                          )
                      }
                  })
              })
          })
      })
