// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Firechat {
    struct Chat {
        address user1;
        address user2;
        string[] messagesStrings;
        address[] messageSender;
        uint[] messageTimestamp;
    }

    mapping (bytes32 => Chat) public chats;

    error Unauthorized();
    error InvalidAddress();
    error ChatAlreadyExists();

    event NewChat(address _user1, address _user2);

    function newChat(address _user1, address _user2) public returns (bytes32) {
        if (_user1 == address(0)) revert InvalidAddress();
        if (_user2 == address(0)) revert InvalidAddress();
        if (_user1 == _user2) revert InvalidAddress();

        bytes32 chatHash = keccak256(abi.encode(_user1, _user2));
        Chat memory existingChat = chats[chatHash];
        if (existingChat.user1 != address(0)) revert ChatAlreadyExists();
        // Not checking user1 != address(0) as we don't allow to create with address(0)
        // If chat is created => both users are non-address(0)

        // only one Chat between two addresses, no matter who is user1/user2
        bytes32 reverseChatHash = keccak256(abi.encode(_user2, _user1));
        Chat memory reverseExistingChat = chats[reverseChatHash];
        if (reverseExistingChat.user1 != address(0)) revert ChatAlreadyExists();

        chats[chatHash] = Chat(
            _user1,
            _user2,
            new string[](0),
            new address[](0),
            new uint[](0)
        );

        emit NewChat(_user1, _user2);
        return chatHash;
    }

    function sendMessage(
        string calldata _messageString,
        bytes32 _chatHash
    ) public returns (string memory messageString, address messageSender, uint messageTimestamp) {
        Chat memory chat = chats[_chatHash];
        if (msg.sender != chat.user1 && msg.sender != chat.user2) revert Unauthorized();

        chats[_chatHash].messagesStrings.push(_messageString);
        chats[_chatHash].messageSender.push(msg.sender);
        chats[_chatHash].messageTimestamp.push(block.timestamp);

        return (_messageString, msg.sender, block.timestamp);
    }

    function getChatHistory(bytes32 chatHash) external view returns (
        string[] memory,
        address[] memory,
        uint[] memory
    ) {
        // EVM won't return the array properties in the Chat struct to an external contract.
        Chat memory chat = chats[chatHash];
        return (
            chat.messagesStrings,
            chat.messageSender,
            chat.messageTimestamp
        );
    }
}
