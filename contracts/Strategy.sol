// "SPDX-License-Identifier: UNLICENSED"

pragma solidity 0.7.4;

contract Strategy {
  enum cubesType {
    INVEST
}

struct cubesDetails{
    address protocolAddress;
    bytes abis;
}

mapping(cubesType => cubesDetails[]) private cubes;

/**
 * @dev add new multiple cubes to strategy, based on cubes further
 *      investment will be done.
 * @param _protocolAddress address of tos
 * @param _abis json data of abicall
 * @param _cType Cubes Type(currently only: INVEST)
 */
function addCubes(
    address[] memory _protocolAddress,
    bytes[] memory _abis,
    cubesType  _cType
)
    external
{
    require(locked == false, 
    "Strategy is locked and cannot be changed"
    );

    require(
        _protocolAddress.length == _abis.length,
        "Tos and datas length inconsistent"
    );

    cubesDetails memory cube;
    for (uint256 i = 0; i < _protocolAddress.length; i++)
    {
        
        cube.protocolAddress = _protocolAddress[i];
        cube.abis = _abis[i];

        cubes[_cType].push(cube);
    }
}


 /**
     * @dev When this function is called it will run strategy
     *      based on cubes added to strategy.
     * @param _cType Cubes Type(currently only: INVEST)
     */
    function runStrategy(
        cubesType _cType
    )
        public payable
    {
        for (uint256 i = 0; i < cubes[_cType].length; i++) {
                executeCube(cubes[_cType][i].protocolAddress, cubes[_cType][i].abis);
        }
    }
}

/**
 * @dev This function executes cubes one by one
 * @param _target Protocol Address
 * @param _data Protocol function callData Abi
 */
function executeCube(
    address _target,
    bytes memory _data
) 
    internal 
{
    require(_target != address(0), "target-invalid");

    assembly {
        let succeeded := call(
            gas(),
            _target,
            0,
            add(_data, 0x20),
            mload(_data),   
            0,
            0
        )

        switch iszero(succeeded)
            case 1 {
                // throw if delegatecall failed
                let size := returndatasize()
                returndatacopy(0x00, 0x00, size)
                revert(0x00, "Transcation failed")
        }
    }
}