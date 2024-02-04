// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    string public ownerName;
    uint256 public age;
    string public gender;
    uint256 public loans;
    uint256 public minDeposit;
    uint256 public minWithdrawal;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event LimitSet(uint256 minDeposit, uint256 minWithdrawal);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        ownerName = "Shivkumar";
        age = 20;
        gender = "Male";
        loans = 500;
        minDeposit = 1 ether; // Default minimum deposit amount
        minWithdrawal = 1 ether; // Default minimum withdrawal amount
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function getOwnerInfo() public view returns(string memory, uint256, string memory, uint256) {
        return (ownerName, age, gender, loans);
    }

    function setLimit(uint256 _minDeposit, uint256 _minWithdrawal) public {
        require(msg.sender == owner, "You are not the owner of this account");
        minDeposit = _minDeposit;
        minWithdrawal = _minWithdrawal;
        emit LimitSet(_minDeposit, _minWithdrawal);
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");
        require(_amount >= minDeposit, "Deposit amount is less than minimum limit");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        require(_withdrawAmount >= minWithdrawal, "Withdrawal amount is less than minimum limit");

        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }
}
