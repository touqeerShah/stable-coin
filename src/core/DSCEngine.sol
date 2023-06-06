// SPDX-License-Identifier: MIT

// This is considered an Exogenous, Decentralized, Anchored (pegged), Crypto Collateralized low volitility coin

// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers

// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions

pragma solidity 0.8.19;

import {OracleLib, AggregatorV3Interface} from "../lib/OracleLib.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./../interface/IDSCEngine.sol";
import {IDecenttializedStableCoin} from "./../interface/IDecenttializedStableCoin.sol";

/*
 * @title DSCEngine
 * @author TK
 * this system will design to be as minimal as possible and have the token maintain a 1 token - 1$ Peg.
 * this stablecoine has the properties
 * - Exogenous Collateral
 * - Dollar Pegged
 * - Alogorotmically Stable
 *
 * It is smimilar to DAI if DAI hash no Governace , no fee and was only backed by WETH or WBTC
 *
 * Our DSThis C system have always be overcollateralized , at no point it will not be less the DSC,it should
 * Always be more collateral the coins in system
 * @notice This is core or main Contract of the system.
 * - Mining
 * - Redeeming DSC
 * - Depositing
 * - Withdrawing Collateral
 * @noice This contract is very lossely based on MakerDAO DSS (DAI) System
 *
 */
contract DSCEngine is ReentrancyGuard, IDSCEngine {
    ///////////////////
    // Types
    ///////////////////
    using OracleLib for AggregatorV3Interface;

    /// State Varaibles   *
    IDecenttializedStableCoin private immutable i_dsc;

    uint256 private constant LIQUIDATION_THRESHOLD = 50; // This means you need to be 200% over-collateralized
    uint256 private constant LIQUIDATION_BONUS = 10; // This means you get assets at a 10% discount when liquidating
    uint256 private constant LIQUIDATION_PRECISION = 100;
    uint256 private constant MIN_HEALTH_FACTOR = 1e18;
    uint256 private constant PRECISION = 1e18;
    uint256 private constant ADDITIONAL_FEED_PRECISION = 1e10;
    uint256 private constant FEED_PRECISION = 1e8;

    /// @dev Mapping of token address to price feed address
    mapping(address collateralToken => address priceFeed) private s_priceFeeds;
    /// @dev Amount of collateral deposited by user
    mapping(address user => mapping(address collateralToken => uint256 amount)) private s_collateralDeposited;
    /// @dev Amount of DSC minted by user
    mapping(address user => uint256 amount) private s_DSCMinted;
    /// @dev If we know exactly how many tokens we have, we could make this immutable!
    address[] private s_collateralTokens;
    //***********************************************************
    ///////////////////////////
    ///Modifier

    modifier moreThenZero(uint256 amount) {
        if (amount == 0) {
            revert DSCEngine__AmountMustBeMoreThanZero();
        }
        _;
    }

    modifier isAllowedToken(address token) {
        if (s_priceFeeds[token] == address(0)) {
            revert DSCEngine__TokenNotAllowed(token);
        }
        _;
    }

    //////////////////////////
    ///////////////////
    // Functions
    ///////////////////
    constructor(address[] memory tokenAddresses, address[] memory priceFeedAddresses, address dscAddress) {
        if (tokenAddresses.length != priceFeedAddresses.length) {
            revert DSCEngine__TokenAddressesAndPriceFeedAddressesAmountsDontMatch();
        }
        // These feeds will be the USD pairs
        // For example ETH / USD or MKR / USD
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            s_priceFeeds[tokenAddresses[i]] = priceFeedAddresses[i];
            s_collateralTokens.push(tokenAddresses[i]);
        }
        i_dsc = IDecenttializedStableCoin(dscAddress);
    }

    ///Function
    /**
     * @param tokenCollateralAddress collateral token address
     * @param amountCollateral amount to put on collateral
     * @param amountToMint amount to mint
     * @notice This function all to combine deposit and mint stable coin
     */
    function depostCollateralAndMintDsc(address tokenCollateralAddress, uint256 amountCollateral, uint256 amountToMint)
        external
    {
        depostCollateral(tokenCollateralAddress, amountCollateral);
        minDsc(amountToMint);
    }

    /**
     * This function where user will deposit and state ther collateral initially
     * @param tokenCollateralAddress: The ERC20 token address of the collateral you're depositing
     * @param amountCollateral: The amount of collateral you're depositing
     */
    function depostCollateral(address tokenCollateralAddress, uint256 amountCollateral)
        public
        moreThenZero(amountCollateral)
        isAllowedToken(tokenCollateralAddress)
        nonReentrant
    {
        s_collateralDeposited[msg.sender][tokenCollateralAddress] += amountCollateral;
        emit CollateralDeposited(msg.sender, amountCollateral);
        bool success = IERC20(tokenCollateralAddress).transferFrom(msg.sender, address(this), amountCollateral);
        if (!success) {
            revert DSCEngine__TransferFailed();
        }
    }
    /**
     * This function where user will redeem or get back the collateral
     * @param tokenCollateralAddress: The ERC20 token address of the collateral you're depositing
     * @param amountCollateral: The amount of collateral you're depositing
     *  1. health check mush be 1 Affer collateral pullled
     * CEI Check ,Effects,Interactions
     */

    function redeemCollateral(address tokenCollateralAddress, uint256 amountCollateral)
        public
        moreThenZero(amountCollateral)
        nonReentrant
    {
        s_collateralDeposited[msg.sender][tokenCollateralAddress] -= amountCollateral;
        emit CollateralRedeemed(msg.sender, tokenCollateralAddress, amountCollateral);
        bool success = IERC20(tokenCollateralAddress).transfer(msg.sender, amountCollateral);
        if (!success) {
            revert DSCEngine__TransferFailed();
        }
        _revertIfHealthFactorIsBroken(msg.sender);
    }

    /**
     * This function where user will redeem or get back the collateral and burn stable token
     * @param tokenCollateralAddress: The ERC20 token address of the collateral you're depositing
     * @param amountCollateral: The amount of collateral you're depositing
     * @param amountToBurn how much want to burn
     */
    function redeemCollateralFroDec(address tokenCollateralAddress, uint256 amountCollateral, uint256 amountToBurn)
        external
    {
        bureDsc(amountToBurn);
        redeemCollateral(tokenCollateralAddress, amountCollateral);
    }

    function bureDsc(uint256 amount) public moreThenZero(amount) nonReentrant {
        bool success = i_dsc.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert DSCEngine__TransferFailed();
        }
        i_dsc.burn(amount);
    }
    /*
     * This where we mint our DSC token or clame our collatral into DSC token
     * @param amountDscToMint  the Amount of Token which we want to mint against collateral
     * @notice must have more value of collateral the coin he want to mint
     */

    function minDsc(uint256 amountDscToMint) public moreThenZero(amountDscToMint) nonReentrant {
        s_DSCMinted[msg.sender] += amountDscToMint;
        _revertIfHealthFactorIsBroken(msg.sender);
        bool minted = i_dsc.mint(msg.sender, amountDscToMint);

        if (minted != true) {
            revert DSCEngine__MintFailed();
        }
        emit MinDsc(msg.sender, amountDscToMint);
    }

    function getHealthFactory() external {}

    /*
     * @param collateral: The ERC20 token address of the collateral you're using to make the protocol solvent again.
     * This is collateral that you're going to take from the user who is insolvent.
     * In return, you have to burn your DSC to pay off their debt, but you don't pay off your own.
     * @param user: The user who is insolvent. They have to have a _healthFactor below MIN_HEALTH_FACTOR
     * @param debtToCover: The amount of DSC you want to burn to cover the user's debt.
     *
     * @notice: You can partially liquidate a user.
     * @notice: You will get a 10% LIQUIDATION_BONUS for taking the users funds.
     * @notice: This function working assumes that the protocol will be roughly 150% overcollateralized in order for this to work.
     * @notice: A known bug would be if the protocol was only 100% collateralized, we wouldn't be able to liquidate anyone.
     * For example, if the price of the collateral plummeted before anyone could be liquidated.
     */

    function liquidate(address collateral, address user, uint256 debtToCover) external nonReentrant {}

    //**************************************************************/
    //              Private and Internal funcation
    //**************************************************************/

    /**
     * This will check health factor and  if not health reverted
     * @param user address of user who mint the token
     */
    function _revertIfHealthFactorIsBroken(address user) internal view {
        uint256 userHealthFactor = _healthFactor(user);
        if (userHealthFactor < MIN_HEALTH_FACTOR) {
            revert DSCEngine__BreaksHealthFactor(userHealthFactor);
        }
    }

    /**
     * Get all the user Details about his account like how much he already minted and total collateral value in dollars
     * @param user address of user who mint the token
     * @return totalDscMinted
     * @return collateralValueInUsd
     */
    function _getAccountInformation(address user)
        private
        view
        returns (uint256 totalDscMinted, uint256 collateralValueInUsd)
    {
        totalDscMinted = s_DSCMinted[user];
        collateralValueInUsd = getAccountCollateralValue(user);
    }

    /**
     * This will check that user is not going to mint more token the collateral and not going to liquitaed
     * @param user address of user who mint the token
     */
    function _healthFactor(address user) private view returns (uint256) {
        (uint256 totalDscMinted, uint256 collateralValueInUsd) = _getAccountInformation(user);
        return _calculateHealthFactor(totalDscMinted, collateralValueInUsd);
    }

    /**
     *
     * This will connect to Chainlink and get latest Price of the Collataral token which hel to calculate
     * The Total value user owen
     * @param token address of collateral token
     * @param amount amount  he hold against that token
     */

    function getUsdValue(address token, uint256 amount) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(s_priceFeeds[token]);
        (, int256 price,,,) = priceFeed.staleCheckLatestRoundData();
        // 1 ETH = 1000 USD
        // The returned value from Chainlink will be 1000 * 1e8
        // Most USD pairs have 8 decimals, so we will just pretend they all do
        // We want to have everything in terms of WEI, so we add 10 zeros at the end
        return ((uint256(price) * ADDITIONAL_FEED_PRECISION) * amount) / PRECISION;
    }
    /**
     *  this will calculat how much he allow to mint more based on his collateral
     * @param totalDscMinted amount already minted
     * @param collateralValueInUsd amount of collateral in current token price in dollars
     */

    function _calculateHealthFactor(uint256 totalDscMinted, uint256 collateralValueInUsd)
        internal
        pure
        returns (uint256)
    {
        if (totalDscMinted == 0) return type(uint256).max;
        /**
         * $150 ETH / 100 DSC =1.5
         * 150 * 50% =7500/100 = (75/100)<1 // this problem and liqu=iuidated
         * 1000ETH/ 100DSC
         * 1000 * 50% = 50000/100= 500/100 DSC = 5>1 now it is fine
         */

        uint256 collateralAdjustedForThreshold = (collateralValueInUsd * LIQUIDATION_THRESHOLD) / LIQUIDATION_PRECISION;
        return (collateralAdjustedForThreshold * PRECISION) / totalDscMinted;
    }

    //**************************************************************/
    //              Public and View funcation
    //**************************************************************/
    /**
     * calculate all the collateral amount user deposit based on current price of the
     * Collateral token
     * @param user address of user who mint the token
     */
    function getAccountCollateralValue(address user) public view returns (uint256 totalCollateralValueInUsd) {
        for (uint256 index = 0; index < s_collateralTokens.length; index++) {
            address token = s_collateralTokens[index];
            uint256 amount = s_collateralDeposited[user][token];
            totalCollateralValueInUsd += getUsdValue(token, amount);
        }
        return totalCollateralValueInUsd;
    }
}
