// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Voting {
    address public admin;
    uint public votingDeadline;
    bool public electionEnded;

    struct Candidate {
        string name;
        uint voteCount;
    }

    Candidate[] public candidates;
    mapping(address => bool) public hasVoted;

    event Voted(address indexed voter, uint indexed candidateId);
    event ElectionEnded();
    event WinnerDeclared(string name, uint voteCount);

    constructor(string[] memory _candidateNames, uint _durationInSeconds) {
        admin = msg.sender;
        votingDeadline = block.timestamp + _durationInSeconds;
        for (uint i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({ name: _candidateNames[i], voteCount: 0 }));
        }
    }

    function vote(uint candidateId) public {
        require(!electionEnded, "Election already ended");
        require(block.timestamp <= votingDeadline, "Voting period has ended");
        require(!hasVoted[msg.sender], "You have already voted.");
        require(candidateId < candidates.length, "Invalid candidate ID");

        candidates[candidateId].voteCount++;
        hasVoted[msg.sender] = true;

        emit Voted(msg.sender, candidateId);
    }

    function endElection() public {
        require(msg.sender == admin, "Only admin can end the election");
        require(!electionEnded, "Election already ended");

        electionEnded = true;
        emit ElectionEnded();

        (string memory name, uint votes) = determineWinner();
        emit WinnerDeclared(name, votes);
    }

    function determineWinner() internal view returns (string memory, uint) {
        uint winningVoteCount = 0;
        string memory winnerName = "";

        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winnerName = candidates[i].name;
            }
        }

        return (winnerName, winningVoteCount);
    }

    function getCandidate(uint candidateId) public view returns (string memory, uint) {
        require(candidateId < candidates.length, "Invalid ID");
        Candidate memory c = candidates[candidateId];
        return (c.name, c.voteCount);
    }

    function getCandidatesCount() public view returns (uint) {
        return candidates.length;
    }
}