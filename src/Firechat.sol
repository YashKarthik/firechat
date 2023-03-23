// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Firechat {
    struct Chat {
        address user1;
        address user2;
        Message[50] messages;
        uint messageCount;
    }

    struct Message {
        address sender;
        string content;
        uint timestamp;
    }

    mapping (bytes32 => Chat) public chats;

    error Unauthorized();
    error InvalidAddress();
    error ChatAlreadyExists();

    function newChat(address _user1, address _user2) public returns (bytes32) {
        if (_user1 == address(0)) revert InvalidAddress();
        if (_user2 == address(0)) revert InvalidAddress();

        bytes32 chatHash = keccak256(abi.encode(_user1, _user2));
        Chat memory existingChat = chats[chatHash];

        if (existingChat.user1 != address(0)) revert ChatAlreadyExists();
        // Not checking user1 != address(0) as we don't allow to create with address(0)
        // If chat is created => both users are non-address(0)

        Message[50] calldata msgs;
        chats[chatHash] = Chat(_user1, _user2, msgs, 0);
        return chatHash;
    }

    function sendMessage(
        string calldata _messageContent,
        bytes32 _chatHash
    ) public returns (Message memory) {
        Chat memory chat = chats[_chatHash];
        if (msg.sender != chat.user1 && msg.sender != chat.user2) revert Unauthorized();

        Message memory message = Message(msg.sender, _messageContent, block.timestamp);
        chats[_chatHash].messages[chats[_chatHash].messageCount] = message;
        chats[_chatHash].messageCount++;

        return message;
    }
}
