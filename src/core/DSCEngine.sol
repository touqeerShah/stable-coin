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
 * Our DSC system have always be overcollateralized , at no point it will not be less the DSC,it should
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
    /// State Varaibles   *
    IDecenttializedStableCoin private immutable i_dsc;

    /// @dev Mapping of token address to price feed address
    mapping(address collateralToken => address priceFeed) private s_priceFeeds;
    /// @dev Amount of collateral deposited by user
    mapping(address user => mapping(address collateralToken => uint256 amount))
        private s_collateralDeposited;
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
    constructor(
        address[] memory tokenAddresses,
        address[] memory priceFeedAddresses,
        address dscAddress
    ) {
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

    function depostCollateralAndMintDsc() external {}

    /*
     * This function where user will deposit and state ther collateral initially
     * @param tokenCollateralAddress: The ERC20 token address of the collateral you're depositing
     * @param amountCollateral: The amount of collateral you're depositing
     */
    function depostCollateral(
        address tokenCollateralAddress,
        uint256 amountCollateral
    )
        external
        moreThenZero(amountCollateral)
        isAllowedToken(tokenCollateralAddress)
        nonReentrant
    {}

    function redeemCollateralFroDec() external {}

    function redeemCollateral() external {}

    function bureDsc() external {}

    function minDsc() external {}

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

    function liquidate(
        address collateral,
        address user,
        uint256 debtToCover
    ) external nonReentrant {}
}
