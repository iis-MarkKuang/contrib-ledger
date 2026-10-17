// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {RedeemVault} from "../src/RedeemVault.sol";

contract DeployRedeem is Script {
    function run() external returns (RedeemVault vault) {
        address registry = vm.envAddress("CONTRACT_ADDRESS");
        vm.startBroadcast();
        vault = new RedeemVault(registry);
        vm.stopBroadcast();
        console.log("RedeemVault", address(vault));
    }
}
