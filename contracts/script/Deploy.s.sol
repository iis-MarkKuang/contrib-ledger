// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";
import {RedeemVault} from "../src/RedeemVault.sol";

contract Deploy is Script {
    function run() external returns (ContributionRegistry registry, RedeemVault vault) {
        address maintainer = vm.envAddress("MAINTAINER_ADDRESS");
        vm.startBroadcast();
        registry = new ContributionRegistry(maintainer);
        vault = new RedeemVault(address(registry));
        vm.stopBroadcast();
        console.log("ContributionRegistry", address(registry));
        console.log("RedeemVault", address(vault));
    }
}
