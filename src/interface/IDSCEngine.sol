// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IDSCEngine {
    //Events
    event CollateralDeposited(address indexed depositor, uint256 indexed amount);
    event MinDsc(address indexed minter, uint256 indexed amount);
    // Error

    error DSCEngine__AmountMustBeMoreThanZero();
    error DSCEngine__BurnAmountExceedsBalance();
    error DSCEngine__NotZeroAddress();
    error DSCEngine__TokenNotAllowed(address token);
    error DSCEngine__TokenAddressesAndPriceFeedAddressesAmountsDontMatch();
    error DSCEngine__TransferFailed();
    error DSCEngine__BreaksHealthFactor(uint256 userHealthFactor);
    error DSCEngine__MintFailed();

    function depostCollateralAndMintDsc() external;

    function depostCollateral(address tokenCollateralAddress, uint256 amountCollateral) external;

    function redeemCollateralFroDec() external;

    function redeemCollateral() external;

    function bureDsc() external;

    function minDsc(uint256 amountDscToMint) external;

    function liquidate(address collateral, address user, uint256 debtToCover) external;

    function getHealthFactory() external;

    // Function created for internal used
    // function _revertIfHealthFactorIsBroken(address user) external view;
    // function _getAccountInformation(address user) external view returns (uint256);
    // function _healthFactor(address user) external view returns (uint256);
    // function _getAccountCollateralValue(address user) external view returns (uint256);
    // function _calculateHealthFactor(address user) external view returns (uint256);
}
