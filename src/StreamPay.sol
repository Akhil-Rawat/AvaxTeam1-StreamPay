// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StreamPay {
    // Events
    event ProviderRegistered(address indexed provider, string name);
    event PlanCreated(uint256 indexed planId, address indexed provider, uint256 price, uint256 interval);
    event SubscriptionCreated(uint256 indexed subscriptionId, address indexed user, uint256 indexed planId);
    event PaymentProcessed(address indexed from, address indexed to, uint256 amount, uint256 indexed subscriptionId);
    event ProviderEarnings(address indexed provider, uint256 indexed planId, uint256 amount);
    event EscrowDeposit(address indexed user, uint256 amount, uint256 newBalance);
    event EscrowWithdrawal(address indexed user, uint256 amount, uint256 newBalance);

    address public admin;
    uint256 public protocolFeeBps = 250; // 2.5%
    uint256 public nextPlanId = 1;
    uint256 public nextSubscriptionId = 1;

    mapping(address => bool) public registeredProviders;
    mapping(uint256 => address) public planProvider;
    mapping(uint256 => uint256) public planPrice;
    mapping(uint256 => uint256) public planInterval;
    mapping(uint256 => uint256) public subscriptionPlanId;
    mapping(uint256 => address) public subscriptionSubscriber;
    mapping(uint256 => uint256) public subscriptionLastPayment;
    mapping(uint256 => bool) public subscriptionActive;
    mapping(address => uint256) public userEscrowBalance;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyRegisteredProvider() {
        require(registeredProviders[msg.sender], "Not registered provider");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerProvider(string calldata name) external {
        require(bytes(name).length > 0 && bytes(name).length <= 100, "Invalid name");
        require(!registeredProviders[msg.sender], "Already registered");
        registeredProviders[msg.sender] = true;
        emit ProviderRegistered(msg.sender, name);
    }

    function createPlan(uint256 price, uint256 interval) external onlyRegisteredProvider returns (uint256) {
        require(price > 0 && interval > 0, "Invalid params");
        uint256 planId = nextPlanId++;
        planProvider[planId] = msg.sender;
        planPrice[planId] = price;
        planInterval[planId] = interval;
        emit PlanCreated(planId, msg.sender, price, interval);
        return planId;
    }

    function subscribe(uint256 planId) external payable returns (uint256) {
        require(planProvider[planId] != address(0), "Plan not found");
        uint256 price = planPrice[planId];
        if (msg.value > 0) {
            userEscrowBalance[msg.sender] += msg.value;
            emit EscrowDeposit(msg.sender, msg.value, userEscrowBalance[msg.sender]);
        }
        require(userEscrowBalance[msg.sender] >= price, "Insufficient escrow");
        uint256 protocolFee = (price * protocolFeeBps) / 10000;
        uint256 providerAmount = price - protocolFee;
        uint256 subscriptionId = nextSubscriptionId++;
        subscriptionPlanId[subscriptionId] = planId;
        subscriptionSubscriber[subscriptionId] = msg.sender;
        subscriptionLastPayment[subscriptionId] = block.timestamp;
        subscriptionActive[subscriptionId] = true;
        userEscrowBalance[msg.sender] -= price;
        payable(planProvider[planId]).transfer(providerAmount);
        emit SubscriptionCreated(subscriptionId, msg.sender, planId);
        emit PaymentProcessed(msg.sender, planProvider[planId], providerAmount, subscriptionId);
        emit ProviderEarnings(planProvider[planId], planId, providerAmount);
        return subscriptionId;
    }

    function processSubscriptionPayment(uint256 subscriptionId) external {
        require(subscriptionActive[subscriptionId], "Inactive");
        address subscriber = subscriptionSubscriber[subscriptionId];
        uint256 planId = subscriptionPlanId[subscriptionId];
        uint256 price = planPrice[planId];
        uint256 interval = planInterval[planId];
        uint256 lastPayment = subscriptionLastPayment[subscriptionId];
        require(block.timestamp >= lastPayment + interval, "Not due");
        require(userEscrowBalance[subscriber] >= price, "Insufficient escrow");
        uint256 protocolFee = (price * protocolFeeBps) / 10000;
        uint256 providerAmount = price - protocolFee;
        userEscrowBalance[subscriber] -= price;
        subscriptionLastPayment[subscriptionId] = block.timestamp;
        payable(planProvider[planId]).transfer(providerAmount);
        emit PaymentProcessed(subscriber, planProvider[planId], providerAmount, subscriptionId);
        emit ProviderEarnings(planProvider[planId], planId, providerAmount);
    }

    function deposit() external payable {
        require(msg.value > 0, "No value");
        userEscrowBalance[msg.sender] += msg.value;
        emit EscrowDeposit(msg.sender, msg.value, userEscrowBalance[msg.sender]);
    }

    function withdraw(uint256 amount) external {
        require(userEscrowBalance[msg.sender] >= amount && amount > 0, "Insufficient");
        userEscrowBalance[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit EscrowWithdrawal(msg.sender, amount, userEscrowBalance[msg.sender]);
    }

    function getUserBalance(address user) external view returns (uint256) {
        return userEscrowBalance[user];
    }

    function isProviderRegistered(address provider) external view returns (bool) {
        return registeredProviders[provider];
    }

    function getPlans(uint256 max) external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](max);
        uint256 count = 0;
        for (uint256 i = 1; i < nextPlanId && count < max; i++) {
            if (planProvider[i] != address(0)) {
                ids[count++] = i;
            }
        }
        // Resize array
        assembly { mstore(ids, count) }
        return ids;
    }
}
