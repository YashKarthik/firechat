// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Firechat {
    struct Chat {
        address user1;
        address user2;
        Message[] messages;
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
        Chat memory chat = Chat(_user1, _user2, new Message[](0));
        Chat memory existingChat = chats[chatHash];

        if (chat.user1 == existingChat.user1 && chat.user2 == existingChat.user2) revert ChatAlreadyExists();
        // Not checking chat.user1 == existingChat.user2 cuz then `chatHash` would be different;

        chats[chatHash] = chat;
        return chatHash;
    }

    function sendMessage(
        string calldata _messageContent,
        bytes32 _chatHash
    ) public returns (Message memory) {
        Chat memory chat = chats[_chatHash];
        if (msg.sender != chat.user1 && msg.sender != chat.user2) revert Unauthorized();

        Message memory message = Message(msg.sender, _messageContent, block.timestamp);

        chats[_chatHash].messages.push(message);
        return message;
    }
}
