//1. Deposit & Withdrawal from 1 ETH to _amount
//2. Daily Limit on withdrawal (not on deposit)
//3. Emergency Withdrawal that withdraws the whole balance
//4. Transfer of ownership

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public dailyLimit;
    uint256 public lastWithdrawTime;
    uint256 public dailyWithdrawnAmount;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    constructor(uint256 _dailyLimit) payable {
        owner = payable(msg.sender);
        dailyLimit = _dailyLimit;
        lastWithdrawTime = block.timestamp;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    function transferOwnership(address payable newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function emergencyWithdraw() public onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "Insufficient balance for emergency withdrawal");
        owner.transfer(contractBalance);
        emit EmergencyWithdrawal(owner, contractBalance);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getDailyLimit() public view returns (uint256) {
        return dailyLimit;
    }

    function deposit() public payable onlyOwner {
        emit Deposit(msg.value);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public onlyOwner {
        if (block.timestamp > lastWithdrawTime + 1 days) {
            lastWithdrawTime = block.timestamp;
            dailyWithdrawnAmount = 0;
        }
        require(dailyWithdrawnAmount + _withdrawAmount <= dailyLimit, "Exceeds daily withdrawal limit");
        if (address(this).balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: address(this).balance,
                withdrawAmount: _withdrawAmount
            });
        }
        dailyWithdrawnAmount += _withdrawAmount;
        owner.transfer(_withdrawAmount);
        emit Withdraw(_withdrawAmount);
    }
}
