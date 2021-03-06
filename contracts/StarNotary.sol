pragma solidity 0.8.5;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../app/node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

    constructor (
        uint256 initialSupply)  public ERC721 (name(), symbol()) {
        require(initialSupply > 0, "Must provide initial tokens");
        
        _mint(msg.sender, initialSupply);
    }   

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't own");
        starsForSale[_tokenId] = _price;
    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        //return payable(address(uint160(x)));
        return payable(x);
    }

    // Function that allows caller to get a token
    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        safeTransferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        address payable buyerAddressPayable = _make_payable(msg.sender);
        buyerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            ownerAddressPayable.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        Star memory target = tokenIdToStarInfo[_tokenId];

        return target.name;
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        require(msg.sender == ownerOf(_tokenId1) || msg.sender == ownerOf(_tokenId2) , "Sender is not the owner for any token");

      
        //2. You don't have to check for the price of the token (star)... but do it anyway
        uint price1 = starsForSale[_tokenId1];
        uint price2 = starsForSale[_tokenId2];

        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId1)
        address ownerStar1 = ownerOf(_tokenId1);
        address ownerStar2 = ownerOf(_tokenId2);

        Star memory star1 = tokenIdToStarInfo[_tokenId1];
        Star memory star2 = tokenIdToStarInfo[_tokenId2];

        //4. Use _transferFrom function to exchange the tokens.
        transferFrom(ownerStar1, ownerStar2, _tokenId1);
        emit Transfer(ownerStar1, ownerStar2, _tokenId1);

        transferFrom(ownerStar2, ownerStar1, _tokenId2);
        emit Transfer(ownerStar2, ownerStar1, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        require(msg.sender == ownerOf(_tokenId));
        address from = msg.sender;
        address to = _to1;
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        transferFrom(from, to, _tokenId);
        //3. Record event
        emit Transfer(from, to, _tokenId);
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
 
    /**
     * Accessor for token name
     */
    function name() public view virtual override returns (string memory) {
        return "Notarium";
    }

    /**
     * Accessor for token symbol
     */
    function symbol() public view virtual override returns (string memory) {
        return "NTR";
    }

}