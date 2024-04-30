// Get funds from users
// Withdraw funds
// Set a minimum funding value in USD

// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./PriceConvertor.sol";

error NotOwner();

// creating this contract costs 771,527 gas
contract FundMe {
    using PriceConvertor for uint256;

    //uint256 public number;

    // when adding constant, this variable no longer takes a storage spot
    // and much easier to read to
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    // 347 gas - constant
    // 2446 gas - non-constant

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public immutable i_owner;

    // 439 gas - immutable
    // 2574 gas - non-immutable

    // For CONSTANT variables, the value has to be fixed at compile-time,
    // while for IMMUTABLE , it can still be assigned at construction time.

    // The reason that CONSTANT and IMMUTABLE save gas;
    // because instead of storing variables inside storage slots
    // we actually store them directly into the byte code of the contract.

    constructor() {
        i_owner = msg.sender;
    }

    function fund() public payable {
        // Want to able to set a minimum fund amount in USD
        //1. how do we sen ETH to this contract?

        //in order to make function payable with ETH any other native blockchain currency
        // we need to mark the function as payable

        //Smart contracts can hold funds just like how wallets can

        // to get how much value someone's sending, you use msg global variable

        // we tell people that they send at least 1 ETH with this below

        //number = 5;

        //require(msg.value > 1e18,"Did not send enough!!"); // 1e18 = 1 * 10 ** 18 == 1000000000000000000 Wei
        // whole expression is equal to 1ETH
        // Money math in done in terms of wei So 1ETH
        // needs to be set as 1e18 value

        // What is reverting?
        // undo any action before, and send remaining gas back
        // we spend gas to set number to 5, but after that any remaining gas would returned
        // by this require when the condition is not met.
        // and also any prior work undone, which means number is not set to 5 in that example.

        //msg.value.getConversionRate(); equals getConversionRate(msg.value);

        require(
            msg.value.getConversionRate() >= MINIMUM_USD,
            "Did not send enough!"
        );

        //msg.value.getConversionRate() even though function getConversionRate(uint256 ethAmount) in library(PriceConvertor.sol)
        //waits the paramater, we do not pass but
        //msg.value is considered as first paramater any of these library funcitons

        //msg.value gonna have 18 decimal places

        //to track the people who send money to this contract
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        //reset the array
        funders = new address[](0);
        //actually withdraw the funds
        // how to actually withdraw funds from the contract ?
        // how do we send funds back to whomever is calling this?

        // To actually send ether or send native blockchain currency
        // there are 3 ways to do that;
        // 1. transfer
        // 2. send
        // 3. call

        /* 1.TRANSFER */
        // msg.sender is of type ADDRESS
        // payable(msg.sender) is of type PAYABLE ADDRESS
        // In Solidity, in order to send native blockchain token like ethereum;
        // you can only work with payable address to do that.
        // if this line fails, it gives error and revert the transaction
        // https://solidity-by-example.org/sending-ether/
        // payable(msg.sender).transfer(address(this).balance);

        /* 2.SEND */
        // Send does not automatically revet the transaction like Transfer
        // In order to do that, we had to add require to revert transaction
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        //require(sendSuccess,"Send Failed");

        /* Call */
        // returns 2 variables
        // Since call allows us to actually call different functions
        // if that functions returns some date or value, we are gonna save that in that
        // dataReturned variable
        // if the function is succesfully called, callSuccess is true, otherwise false.
        (bool callSuccess /* bytes memory dataReturned */, ) = payable(
            msg.sender
        ).call{value: address(this).balance}("");
        require(callSuccess, "Send Failed");
    }

    modifier onlyOwner() {
        //with writing that modifier in the function declariton, we say;
        // before implementing all of code, implement require statement
        // _; represents all code implementation
        // if we put it after require, first implement require impelemantation
        // then do the rest of work
        // if we put it before, vice versa
        // meaning that ordering is important!!

        //require(msg.sender == i_owner,"Sender is not owner!!");
        if (msg.sender != i_owner) {
            revert NotOwner();
        }
        _;
    }

    // What happens if someone sends this contract ETH without calling the fund function?

    // receive()
    receive() external payable {
        fund();
    }

    // fallback()
    fallback() external payable {
        fund();
    }
}
