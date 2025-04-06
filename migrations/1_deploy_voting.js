const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  const candidates = [
    web3.utils.asciiToHex("Alice"),
    web3.utils.asciiToHex("Bob"),
    web3.utils.asciiToHex("Charlie"),
  ];
  const duration = 60;

  console.log(
    "Deploying Voting contract with:",
    candidates,
    "duration:",
    duration
  );
  deployer.deploy(Voting, candidates, duration);
};
