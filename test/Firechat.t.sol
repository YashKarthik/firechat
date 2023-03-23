// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/Firechat.sol";

contract FirechatTest is Test {
    Firechat firechat;

    address user1 = address(0x123);
    address user2 = address(0x456);

    function setUp() public {
     //   firechat = new Firechat();
    }

    function testNewChat() public {
        firechat.newChat(user1, user2);

        console.log("hello");
        //Firechat.Chat memory chat = firechat.chats(keccak256(abi.encode(user1, user2)));

        //assertEq(chat.user1, user1, "User1 address should match");
        //assertEq(chat.user2, user2, "User2 address should match");
        //assertEq(chat.messages.length, 0, "Messages array should be empty");
    }

    //function testSendMessage() public {
    //    firechat.newChat(user1, user2);

    //    string memory messageContent = "Hello world!";
    //    bytes32 chatHash = keccak256(abi.encode(user1, user2));

    //    firechat.sendMessage(messageContent, chatHash);

    //    Firechat.Chat memory chat = firechat.chats(chatHash);

    //    assertEq(chat.messages.length, 1, "Messages array should have one element");
    //    assertEq(chat.messages[0].sender, msg.sender, "Message sender should match the caller");
    //    assertEq(chat.messages[0].content, messageContent, "Message content should match");
    //}

    //function testSendMessageUnauthorized() public {
    //    firechat.newChat(user1, user2);

    //    string memory messageContent = "Hello world!";
    //    bytes32 chatHash = keccak256(abi.encode(user1, user2));

    //    // Test sending a message from an unauthorized user
    //    (bool success, ) = address(this).call(abi.encodeWithSignature("sendMessage(string,bytes32)", messageContent, chatHash));
    //    assertFalse(success, "Sending a message from an unauthorized user should fail");
    //}
}
