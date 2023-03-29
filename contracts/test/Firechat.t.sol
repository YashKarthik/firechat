// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "forge-std/Test.sol";
import "../src/Firechat.sol";

contract FirechatTest is Test {
    Firechat firechat;
    address alice = address(0x33cc45d8B0336bFA830FB512b54b02a049277403);
    address bob = address(0x599C5A4be2b87F0128b87Fea208DBE5AE41095e4);

    function setUp() public {
        firechat = new Firechat();
    }

    function test_NewChat() public {
        vm.prank(alice);
        bytes32 chatHash = firechat.newChat(alice, bob);
        assertEq(chatHash, keccak256(abi.encode(alice, bob)));

        (address user1, address user2) = firechat.chats(chatHash);
        assertEq(alice, user1, "Alice and user1 address should match.");
        assertEq(bob, user2, "Bob and user2 address should match.");

        string[] memory messageStrings;
        address[] memory messageSender;
        uint[] memory messageTimestamp;

        (messageStrings, messageSender, messageTimestamp) = firechat.getChatHistory(chatHash);
    }

    function test_NewChatAddressZero() public {
        vm.expectRevert();
        firechat.newChat(address(0), bob);

        vm.expectRevert();
        firechat.newChat(alice, address(0));
    }

    function test_SendMessage() public {
        bytes32 chatHash = firechat.newChat(alice, bob);
        string memory messageContent = "Hello world!";

        vm.prank(alice);
        firechat.sendMessage(messageContent, chatHash);

        (
            string[] memory messageStrings,
            address[] memory messageSender,
        ) = firechat.getChatHistory(chatHash);

        assertEq(messageStrings.length, 1, "Messages array should have one element");
        assertEq(messageSender[0], alice, "Message sender should match the caller");
        assertEq(messageStrings[0], messageContent, "Message content should match");
    }

    function test_SendMessageUnauthorized() public {
        bytes32 chatHash = firechat.newChat(alice, bob);
        string memory messageContent = "Hello world!";

        vm.expectRevert();
        firechat.sendMessage(messageContent, chatHash);
    }
}
