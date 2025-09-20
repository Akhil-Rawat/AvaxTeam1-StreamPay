// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {StreamPay} from "../src/StreamPay.sol";

contract DeployStreamPay is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        StreamPay streamPay = new StreamPay();
        
        console.log("StreamPay deployed to:", address(streamPay));
        console.log("Admin:", streamPay.admin());
        console.log("Protocol Fee (BPS):", streamPay.protocolFeeBps());

        vm.stopBroadcast();
    }
}