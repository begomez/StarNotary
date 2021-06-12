const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('Notarium', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('01. User can create a star', async() => {
    let instance = await StarNotary.deployed();

    let owner = accounts[0];
    let starName = "Andromeda";
    let starId = 1;

    await instance.createStar(starName, starId, {from: owner});

    assert.equal(await instance.tokenIdToStarInfo.call(starId), starName);
});

it('02. User can create a star and put it up for sale', async() => {
    let instance = await StarNotary.deployed();

    let owner = accounts[0];
    let starName = "Perseus";
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");

    await instance.createStar(starName, starId, {from: owner});
    await instance.putStarUpForSale(starId, starPrice, {from: owner});

    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('03. User can get the funds after selling a star', async() => {
    let instance = await StarNotary.deployed();
    
    let seller = accounts[0];
    let buyer = accounts[1];
    let starName = "Taurus";
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".02", "ether");

    await instance.createStar(starName, starId, {from: seller});
    await instance.putStarUpForSale(starId, starPrice, {from: seller});

    let sellerBalancePre = await web3.eth.getBalance(seller);
    await instance.approve(buyer, starId, {from: seller, gasPrice: 0});

    await instance.buyStar(starId, {from: buyer, value: balance, gasPrice: 0});
    let sellerBalancePost = await web3.eth.getBalance(seller);
    
    let expected = Number(sellerBalancePre) + Number(starPrice);
    let actual = Number(sellerBalancePost);

    assert.equal(expected, actual);
});

it('04. User can buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();

    let seller = accounts[0];
    let buyer = accounts[1];

    let starName = "Sagitarius";
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    await instance.createStar(starName, starId, {from: seller});
    await instance.putStarUpForSale(starId, starPrice, {from: seller});

    await instance.approve(buyer, starId, {from: seller, gasPrice: 0});

    await instance.buyStar(starId, {from: buyer, value: balance, gasPrice: 0});

    assert.equal(await instance.ownerOf.call(starId), buyer);
});

it('05. When user buys a star, its balance in ether decreases', async() => {
    let instance = await StarNotary.deployed();

    let seller = accounts[0];
    let buyer = accounts[1];
    let starName = "Capricornius";
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".02", "ether");

    await instance.createStar(starName, starId, {from: seller, gasPrice: 0});
    await instance.putStarUpForSale(starId, starPrice, {from: seller, gasPrice: 0});

    let buyerBalancePre = await web3.eth.getBalance(buyer);
    await instance.approve(buyer, starId, {from: seller, gasPrice: 0});

    await instance.buyStar(starId, {from: buyer, value: balance, gasPrice:0});
    const buyerBalancePost = await web3.eth.getBalance(buyer);

    let expected = Number(buyerBalancePre) - Number(buyerBalancePost);
    assert.equal(expected, starPrice);
});


it('06. User can create a star and check contract name and symbol', async() => {
    let instance = await StarNotary.deployed();

    let from = accounts[0];
    let starName = "Red Dwarf";
    let starId = 6;

    // 1. create a Star with different tokenId
    await instance.createStar(starName, starId, {from: from, gasPrice: 0});

    let contractName = "Notarium";
    let contractSymbol = "NTR";

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let nameActual = await instance.name.call();
    let symbolActual = await instance.symbol.call();

    assert.equal(nameActual, contractName);
    assert.equal(symbolActual, contractSymbol);
});

it('07. Users can exchange stars', async() => {
    let instance = await StarNotary.deployed();

    let user1 = accounts[0];
    let user2 = accounts[1];

    // 1. create 2 Stars with different tokenId
    let starNameExpected1 = "Cepheus";
    let starId1 = 7;
    let starNameExpected2 = "Cassiopeia";
    let starId2 = 8;
    await instance.createStar(starNameExpected1, starId1, {from: user1, gasPrice: 0});
    await instance.createStar(starNameExpected2, starId2, {from: user2, gasPrice: 0});

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.setApprovalForAll(user1, true, {from: user2});
    await instance.exchangeStars(starId1, starId2, {from: user1, gasPrice: 0});

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf(starId1), user2);
    assert.equal(await instance.ownerOf(starId2), user1);
});

it('08. User can transfer a star', async() => {
    let instance = await StarNotary.deployed();

    let starNameExpected = "Pegasus";
    let tokenId = 9; 
    let sender = accounts[0];
    let receiver = accounts[1];

    // 1. create a Star with different tokenId
    await instance.createStar(starNameExpected, tokenId, {from: sender, gasPrice: 0});

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(receiver, tokenId, {from: sender, gasPrice: 0});

    // 3. Verify the star owner changed.
    assert.equal(receiver, await instance.ownerOf(tokenId));
});

it('09. User can look for the name of a star', async() => {
    let instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    let creator = accounts[0];
    let starNameExpected = "Centaurus";
    let tokenId = 10;

    await instance.createStar(starNameExpected, tokenId, {from: creator, gasPrice: 0});

    // 2. Call your method lookUptokenIdToStarInfo
    let starNameResult = await instance.lookUptokenIdToStarInfo(tokenId);

    // 3. Verify if you Star name is the same
    assert.equal(starNameExpected, starNameResult);
});