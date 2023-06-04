// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IDSCEngine {
    //Events

    // Error
    error DSCEngine__AmountMustBeMoreThanZero();
    error DSCEngine__BurnAmountExceedsBalance();
    error DSCEngine__NotZeroAddress();
    error DSCEngine__TokenNotAllowed(address token);
    error DSCEngine__TokenAddressesAndPriceFeedAddressesAmountsDontMatch();

    function depostCollateralAndMintDsc() external;

    function depostCollateral(
        address tokenCollateralAddress,
        uint256 amountCollateral
    ) external;

    function redeemCollateralFroDec() external;

    function redeemCollateral() external;

    function bureDsc() external;

    function minDsc() external;

    function liquidate(
        address collateral,
        address user,
        uint256 debtToCover
    ) external;

    function getHealthFactory() external;
}
