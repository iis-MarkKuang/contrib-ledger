// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ContributionRegistry} from "../src/ContributionRegistry.sol";

contract Deploy is Script {
    function run() external returns (ContributionRegistry registry) {
        address maintainer = vm.envAddress("MAINTAINER_ADDRESS");
        vm.startBroadcast();
        registry = new ContributionRegistry(maintainer);
        vm.stopBroadcast();
        console.log("ContributionRegistry", address(registry));
    }
}
