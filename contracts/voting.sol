// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Voting {
    address public admin;
    addre
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

    constructor(bytes[] memory candidateNames, uint durationInSeconds) {
        require(candidateNames.length > 0, "At least one candidate required.");
        require(durationInSeconds > 0, "Duration must be greater than zero.");  

        admin = msg.sender;
        votingDeadline = block.timestamp + durationInSeconds;
        for (uint i = 0; i < candidateNames.length; i++) {
            require(bytes(candidateNames[i]).length > 0, "Candidate name cannot be empty.");
            candidates.push(Candidate({ name: string(abi.encodePacked(candidateNames[i])), voteCount: 0}));
        }
    }

    function vote(uint candidateId) public {
        require(!electionEnded, "Election already ended.");
        require(block.timestamp <= votingDeadline, "Voting period has ended.");
        require(!hasVoted[msg.sender], "You have already voted.");
        require(candidateId < candidates.length, "Invalid candidate ID.");

        candidates[candidateId].voteCount++;
        hasVoted[msg.sender] = true;

        emit Voted(msg.sender, candidateId);
    }

    function endElection() public {
        require(msg.sender == admin, "Only admin can end the election.");
        require(!electionEnded, "Election already ended.");

        electionEnded = true;
        emit ElectionEnded();

        (string memory winnerName, uint winningVoteCount) = determineWinner();        
        emit WinnerDeclared(winnerName, winningVoteCount);
    }

    function determineWinner() internal view returns (string memory, uint) {
        uint winningVoteCount = 0;
        string memory winnerName;

        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winnerName = candidates[i].name;
            }
        }

        return (winnerName, winningVoteCount);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidate(uint candidateId) public view returns (string memory, uint) {
        require(candidateId < candidates.length, "Invalid candidate ID.");
        Candidate memory c = candidates[candidateId];
        return (c.name, c.voteCount);
    }
}