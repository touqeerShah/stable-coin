// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

interface IDecenttializedStableCoin {
    //Events

    // Error
    error DecentralizedStableCoin__AmountMustBeMoreThanZero();
    error DecentralizedStableCoin__BurnAmountExceedsBalance();
    error DecentralizedStableCoin__NotZeroAddress();

    function burn(uint256 _amount) external;

    function mint(address _to, uint256 _amount) external returns (bool);
}
