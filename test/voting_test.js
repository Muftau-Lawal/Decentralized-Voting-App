const Voting = artifacts.require("Voting");

contract(Voting, (accounts) => {
  let votingInstance;
  const candidateNames = ["Alice", "Bob", "Charlie"];
  const votingDuration = 5; // seconds

  const admin = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const voter3 = accounts[3];

  beforeEach(async () => {
    votingInstance = await Voting.new(candidateNames, votingDuration);
  });

  it("should deploy the contract and initialize candidates", async () => {
    for (let i = 0; i < candidateNames.length; i++) {
      const candidate = await votingInstance.candidates(i);
      assert.equal(
        candidate.name,
        candidateNames[i],
        "candidate name mismatch"
      );
      assert.equal(
        candidate.voteCount.toNumber(),
        0,
        "Initial vote count should be zero"
      );
    }
  });

  it("should allow a user to vote for a candidate by index", async () => {
    await votingInstance.vote(1, { from: voter1 });
    const candidate = await votingInstance.candidates(1);
    assert.equal(
      candidate.voteCount.toNumber(),
      1,
      "Vote coount should be 1 after voting"
    );
  });

  it("should emit a Voted event when a vote is cast", async () => {
    const receipt = await votingInstance.vote(0, { from: voter1 });
    assert.equal(receipt.logs[0].event, "Voted");
    assert.equal(receipt.logs[0].args.voter, voter1);
    assert.equal(receipt.logs[0].args.candidateId.toNumber(), 0);
  });

  it("should not allow a user to vote twice", async () => {
    await votingInstance.vote(0, { from: voter2 });
    try {
      await votingInstance.vote(1, { from: voter2 });
      assert.fail("This user was able to vote twice");
    } catch (error) {
      assert.include(
        error.message,
        "You have already voted",
        "Expected 'already voted' error"
      );
    }
  });

  it("should not allow voting after deadline", async () => {
    await new Promise((resolve) =>
      setTimeout(resolve, (votingDuration + 1) * 1000)
    );
    try {
      await votingInstance.vote(1, { from: voter2 });
      assert.fail("Was able to vote after deadline");
    } catch (error) {
      assert.include(
        error.message,
        "Voting period has ended",
        "Expected 'Voting has ended' error"
      );
    }
  });

  it("should not allow voting for an invalid candidtate index", async () => {
    const invalidIndex = candidateNames.length;
    try {
      await votingInstance.vote(invalidIndex, { from: voter3 });
      assert.fail("This user was able to vote for an invalid candidate");
    } catch (error) {
      assert.include(
        error.message,
        "Invalid candidate ID.",
        "Expected 'Invalid candidate ID' error"
      );
    }
  });

  it("should not allow voting after manual election end", async () => {
    await new Promise((resolve) =>
      setTimeout(resolve, (votingDuration + 1) * 1000)
    );
    await votingInstance.endElection({ from: admin });
    try {
      await votingInstance.vote(1, { from: accounts[5] });
      assert.fail("Was able to vote after election was ended");
    } catch (error) {
      assert.include(error.message, "Election already ended");
    }
  });

  it("should restrict endElection to admin", async () => {
    try {
      await votingInstance.endElection({ from: voter1 });
      assert.fail("Non-admin was able to end the election");
    } catch (error) {
      assert.include(
        error.message,
        "Only admin can end the election",
        "Expected 'Only admin' error"
      );
    }
  });

  it("should emit ElectionEnded and WinnerDeclared when ended", async () => {
    await votingInstance.vote(0, { from: voter1 });
    await votingInstance.vote(1, { from: voter2 });
    await votingInstance.vote(1, { from: voter3 }); // Bob gets 2 votes

    const receipt = await votingInstance.endElection({ from: admin });

    // Check the event names safely
    assert.equal(
      receipt.logs[0].event,
      "ElectionEnded",
      "Expected ElectionEnded first"
    );
    assert.equal(
      receipt.logs[1].event,
      "WinnerDeclared",
      "Expected WinnerDeclared second"
    );

    // Validate the winner details
    const winnerLog = receipt.logs[1];
    assert.equal(winnerLog.args.name, "Bob");
    assert.equal(winnerLog.args.voteCount.toNumber(), 2);
  });
});
