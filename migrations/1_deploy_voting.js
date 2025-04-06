const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  const candidates = ["Alice", "Bob", "Charlie"];
  const duration = 60; // in seconds (e.g., 60 seconds voting period)
  deployer.deploy(Voting, candidates, duration);
};
