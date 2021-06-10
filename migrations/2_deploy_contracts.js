const StarNotary = artifacts.require("StarNotary");

module.exports = function(deployer) {
  var decimals = 12;
  deployer.deploy(StarNotary, "Notarium", "NTR", 1000 * (10 ** decimals));
};
