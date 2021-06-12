const StarNotary = artifacts.require("StarNotary");

module.exports = function(deployer) {
  var decimals = 12;
  deployer.deploy(StarNotary, 1000 * (10 ** decimals));
};
