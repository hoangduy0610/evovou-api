// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EVoucherNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    struct Voucher {
        address owner;
        uint256 tokenId;
        uint256 amountEth;
        uint256 amountVnd;
    }

    struct User {
        address wallet;
        uint256[] tokenIds;
        bool exists;
    }

    mapping(uint256 => Voucher) public vouchers;
    mapping(address => User) public users;

    event VoucherPurchased(
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 amountETH,
        uint256 amountVND
    );
    event VoucherRedeemed(
        address indexed redeemer,
        uint256 indexed tokenId,
        uint256 amountETH,
        uint256 amountVND
    );
    event VoucherTransferred(uint256 tokenId, address from, address to);

    uint256 constant EXCHANGE_RATE = 46760000; // 1 ETH = 46,760,000 VND

    constructor() ERC721("EvoVouNFT", "EVNFT") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    function _mintVoucher(
        address recipient,
        string memory tokenURI,
        uint256 amountEth
    ) internal returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(amountEth > 0, "Amount must be greater than zero");

        uint256 newTokenId = tokenCounter;
        _setTokenURI(newTokenId, tokenURI);
        _safeMint(recipient, newTokenId);

        uint256 valueVnd = (amountEth * EXCHANGE_RATE) / 1 ether;

        vouchers[newTokenId] = Voucher({
            owner: recipient,
            tokenId: newTokenId,
            amountEth: amountEth,
            amountVnd: valueVnd
        });
        addTokenToUser(recipient, newTokenId);

        emit VoucherPurchased(recipient, newTokenId, amountEth, valueVnd);

        tokenCounter += 1;
        return newTokenId;
    }

    function purchaseVoucher(string memory tokenURI)
        public
        payable
        returns (uint256)
    {
        return _mintVoucher(msg.sender, tokenURI, msg.value);
    }

    function generateVoucherToAddress(
        address recipient,
        string memory tokenURI,
        uint256 amountEth
    ) public onlyOwner returns (uint256) {
        return _mintVoucher(recipient, tokenURI, amountEth);
    }

    function redeemVoucher(uint256 tokenId) public {
        // require(ownerOf(tokenId) == msg.sender, "You must own the voucher to redeem it");
        require(
            vouchers[tokenId].owner == msg.sender || msg.sender == owner(),
            "Caller is not the owner or admin"
        );

        // Chuyển NFT về địa chỉ voucherReceiver hoặc burn tùy ý
        // _transfer(msg.sender, voucherReceiver, tokenId);

        _burn(tokenId); // 🔥 Burn NFT hoàn toàn

        Voucher memory voucherRd = vouchers[tokenId];

        emit VoucherRedeemed(
            msg.sender,
            tokenId,
            voucherRd.amountEth,
            voucherRd.amountVnd
        );

        delete vouchers[tokenId];

        removeTokenFromUser(voucherRd.owner, tokenId);
    }

    function addTokenToUser(address addr, uint256 tokenId) internal {
        if (!users[addr].exists) {
            uint256[] memory tempTokenIds = new uint256[](1);
            tempTokenIds[0] = tokenId;
            users[addr] = User({
                wallet: addr,
                tokenIds: tempTokenIds,
                exists: true
            });
        } else {
            users[addr].tokenIds.push(tokenId);
        }
    }

    function removeTokenFromUser(address addr, uint256 tokenId) internal {
        uint256 count = 0;
        uint256[] memory tempTokenIds = new uint256[](
            users[addr].tokenIds.length - 1
        );
        for (uint256 i = 0; i < users[addr].tokenIds.length; i++) {
            if (users[addr].tokenIds[i] != tokenId) {
                tempTokenIds[count] = users[addr].tokenIds[i];
                count += 1;
            }
        }
        users[addr].tokenIds = tempTokenIds;
    }

    function getMyVouchers() public view returns (Voucher[] memory) {
        return getVouchersOf(msg.sender);
    }

    function getVouchersOf(address user)
        public
        view
        onlyOwner
        returns (Voucher[] memory)
    {
        uint256 voucherCount = users[user].tokenIds.length;
        Voucher[] memory result = new Voucher[](voucherCount);
        uint256 index = 0;
        for (uint256 i = 0; i < voucherCount; i++) {
            uint256 tokenId = users[user].tokenIds[i];
            if (vouchers[tokenId].owner == user) {
                result[index] = vouchers[tokenId];
                index++;
            }
        }

        return result;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function exists(uint256 tokenId) public view returns (bool) {
        // return _exists(tokenId);
        return _ownerOf(tokenId) != address(0);
    }

    function getVoucher(uint256 tokenId) public view returns (Voucher memory) {
        require(exists(tokenId), "Voucher does not exist");
        require(
            vouchers[tokenId].owner == msg.sender,
            "Caller is not the owner"
        );
        Voucher memory v = vouchers[tokenId];
        return v;
    }

    function transferVoucher(uint256 tokenId, address to) public {
        // address owner = ownerOf(tokenId);
        // require(owner == msg.sender, "Caller is not the owner");
        require(
            vouchers[tokenId].owner == msg.sender || msg.sender == owner(),
            "Caller is not the owner or admin"
        );
        require(to != address(0), "Invalid recipient");

        address from = vouchers[tokenId].owner;
        safeTransferFrom(from, to, tokenId);

        // Cập nhật mapping voucher owner
        vouchers[tokenId].owner = to;
        removeTokenFromUser(from, tokenId);
        addTokenToUser(to, tokenId);

        emit VoucherTransferred(tokenId, from, to);
    }
}
