// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IDSCEngine {
    //Events
    event CollateralDeposited(address indexed depositor, uint256 indexed amount);
    event MinDsc(address indexed minter, uint256 indexed amount);
    event CollateralRedeemed(
        address indexed redeemFrom, address indexed redeemto, address indexed token, uint256 amount
    );

    // Error

    error DSCEngine__AmountMustBeMoreThanZero();
    error DSCEngine__BurnAmountExceedsBalance();
    error DSCEngine__NotZeroAddress();
    error DSCEngine__TokenNotAllowed(address token);
    error DSCEngine__TokenAddressesAndPriceFeedAddressesAmountsDontMatch();
    error DSCEngine__TransferFailed();
    error DSCEngine__BreaksHealthFactor(uint256 userHealthFactor);
    error DSCEngine__MintFailed();
    error DSCEngine__HealthFactorOk();
    error DSCEngine__HealthFactorNotImporved();

    function depostCollateralAndMintDsc(address tokenCollateralAddress, uint256 amountCollateral, uint256 amountToMint)
        external;

    function depostCollateral(address tokenCollateralAddress, uint256 amountCollateral) external;

    function redeemCollateralFroDec(address tokenCollateralAddress, uint256 amountCollateral, uint256 amountToBurn)
        external;

    function redeemCollateral(address tokenCollateralAddress, uint256 amountCollateral) external;

    function burnDsc(uint256 amount) external;

    function minDsc(uint256 amountDscToMint) external;

    function liquidate(address collateral, address user, uint256 debtToCover) external;

    function getHealthFactory() external;
    function getTokenAmountFromUsd(address token, uint256 usdAmountInWei) external view returns (uint256);
    // Function created for internal used
    // function _revertIfHealthFactorIsBroken(address user) external view;
    // function _getAccountInformation(address user) external view returns (uint256);
    // function _healthFactor(address user) external view returns (uint256);
    // function _getAccountCollateralValue(address user) external view returns (uint256);
    // function _calculateHealthFactor(address user) external view returns (uint256);
}
