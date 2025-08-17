// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestStruct {
    struct Test {
        address addr;
        uint256 num;
        address[] tokens;
    }
    
    mapping(address => Test) public tests;
    
    function setTest(address user, address[] calldata _tokens) external {
        Test memory temp = Test({
            addr: user,
            num: 123,
            tokens: _tokens
        });
        
        tests[user] = temp;
    }
    
    function getTest(address user) external view returns (address, uint256, uint256) {
        Test memory test = tests[user];
        return (test.addr, test.num, test.tokens.length);
    }
}
