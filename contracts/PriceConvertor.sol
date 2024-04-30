// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConvertor {
    // Libraries are similar to contracts, but you can't declare any state variable and you can't send ether.
    // A library is embedded into the contract if all library functions are internal.
    // Otherwise the library must be deployed and then linked before the contract is deployed.
    // https://solidity-by-example.org/library/

    function getPrice() internal view returns (uint256) {
        //ABI
        //address 0x694AA1769357215DE4FAC081bf1f309aDC325306
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        (
            ,
            /*uint80 roundID*/ int256 price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
            ,
            ,

        ) = priceFeed.latestRoundData();
        // ETH in terms of USD
        // ~ 3000.00000000
        // msg.value and price here have different decimal places
        //we have multiple price with 1e10 to match their unit
        // because price has 8 decaimal places and msh.value has 18 decimal places
        return uint256(price * 1e10); // 1**10= 10000000000
        //also msg.value is uint256 but price is int256
        // we need to convert price to be uint256 to match the types of these two variables
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        return priceFeed.version();
    }

    function getConversionRate(
        uint256 ethAmount
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
