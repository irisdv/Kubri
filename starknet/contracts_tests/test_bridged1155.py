import os
import pytest

from starkware.starknet.testing.starknet import Starknet
from starkware.starknet.testing.contract import StarknetContract
from starkware.starkware_utils.error_handling import StarkException

L1_GATEWAY_ADDRESS = 0x1
L1_TOKEN_ADDRESS = 0x1
BRIDGE_MODE_WITHDRAW = 1
L1_OWNER = 0x1

L2_CONTRACTS_DIR = os.path.join(os.getcwd(), "contracts")
ERC1155_FILE = os.path.join(L2_CONTRACTS_DIR, "bridged1155.cairo")
BRIDGE_FILE = os.path.join(L2_CONTRACTS_DIR, "gateway1155.cairo")
ACCOUNT_FILE = os.path.join(L2_CONTRACTS_DIR, "account.cairo")

@pytest.fixture
async def starknet() -> Starknet:
    return await Starknet.empty()

@pytest.fixture
async def auth_user(starknet: Starknet) -> StarknetContract:
    return await starknet.deploy(source=ACCOUNT_FILE, 
        constructor_calldata=[
            1903647282632399027225629500434100617446916994367413898913170243228889244137
        ],)

    
@pytest.fixture
async def user1(starknet: Starknet) -> StarknetContract:
    return await starknet.deploy(source=ACCOUNT_FILE, 
        constructor_calldata=[
            1903647282632567027225629500434100617446916994367413898913170243228889244137
        ],)

@pytest.fixture
async def l2_bridge(
    starknet: Starknet
) -> StarknetContract:
    return await starknet.deploy(
        source=BRIDGE_FILE,
        constructor_calldata=[
            L1_GATEWAY_ADDRESS
        ],
    )

@pytest.fixture
async def l2_erc1155(
    starknet: Starknet,
    l2_bridge: StarknetContract
) -> StarknetContract:
    return await starknet.deploy(
        source=ERC1155_FILE,
        constructor_calldata=[
            l2_bridge.contract_address,
            L1_TOKEN_ADDRESS,
            100
        ],
    )

starknet_contract_address = 0x0

def to_split_uint(a):
    return (a & ((1 << 128) - 1), a >> 128)

def to_uint(a):
    return a[0] + (a[1] << 128)

@pytest.mark.asyncio
async def test_initialization(
    starknet: Starknet,
    l2_bridge: StarknetContract,
    l2_erc1155: StarknetContract,
    auth_user: StarknetContract
):
    assert (await l2_erc1155.get_l1_address().call()).result == (L1_TOKEN_ADDRESS,)
    assert (await l2_erc1155.get_gateway_address().call()).result == (l2_bridge.contract_address,)


@pytest.mark.asyncio
async def test_bridge_to_l1(
    starknet: Starknet,
    l2_bridge: StarknetContract,
    l2_erc1155: StarknetContract,
    auth_user: StarknetContract
):
    await l2_erc1155.initialize_nft_batch(auth_user.contract_address,[1, 2, 2, 1, 5], [10, 11, 3, 2, 22]).invoke()
    execution_info = await l2_erc1155.balance_of(auth_user.contract_address, 1).call()
    assert execution_info.result == (12,)

    execution_info = await l2_erc1155.balance_of(auth_user.contract_address, 2).call()
    assert execution_info.result == (14,)

    assert (await l2_erc1155.get_gateway_address().call()).result == (l2_bridge.contract_address,)

    # check and set approval
    assert (await l2_erc1155.is_approved_for_all(auth_user.contract_address, l2_bridge.contract_address).call()).result == (0,)
    await l2_erc1155.set_approval_for_all(l2_bridge.contract_address, 1).invoke(auth_user.contract_address)
    assert (await l2_erc1155.is_approved_for_all(auth_user.contract_address, l2_bridge.contract_address).call()).result == (1,)

    assert (await l2_bridge.read_custody_l2(l2_erc1155.contract_address, [1, 2, 2, 1, 5], [10, 11, 3, 2, 22]).call()).result == (0,)

    array = await l2_erc1155.get_all_token_by_owner(auth_user.contract_address).call()

    print(array)
    # # test bridge to mainnet function 
    await l2_bridge.bridge_to_mainnet(L1_TOKEN_ADDRESS,l2_erc1155.contract_address, [1, 2, 2, 1], [10, 11, 3, 2], L1_OWNER).invoke(auth_user.contract_address)
    
    array = await l2_erc1155.get_all_token_by_owner(auth_user.contract_address).call()

    print(array)
    # print(ib)
    # check NFTs bridged are in custody in storage_var
    # assert (await l2_bridge.get_custody_l2(l2_erc1155.contract_address, 1, 50).call()).result == (L1_TOKEN_ADDRESS,)
    # assert (await l2_bridge.get_custody_l2(l2_erc1155.contract_address, 2, 100).call()).result == (L1_TOKEN_ADDRESS,)

    # # check NFTs have been burnt 
    # assert (await l2_erc1155.balance_of(auth_user.contract_address, 1).call()).result == (0,)
    # assert (await l2_erc1155.balance_of(auth_user.contract_address, 2).call()).result == (0,)


# @pytest.mark.asyncio
# async def test_bridge_back_to_l2(
#     starknet: Starknet,
#     l2_bridge: StarknetContract,
#     l2_erc1155: StarknetContract,
#     auth_user: StarknetContract,
#     user1: StarknetContract
# ):
#     # Receive message from L1
#     await starknet.send_message_to_l2(
#         from_address=L1_GATEWAY_ADDRESS,
#         to_address=l2_bridge.contract_address,
#         selector="bridge_from_mainnet",
#         payload=[
#             user1.contract_address,
#             int(L1_TOKEN_ADDRESS),
#             l2_erc1155.contract_address,
#             2
#         ],
#     )
#     # check mint credits have been added 
#     execution_info = await l2_bridge.get_mint_credit(L1_TOKEN_ADDRESS, 2, user1.contract_address).call()
#     assert execution_info.result == (l2_erc1155.contract_address,)

#     # Consume mint credits
#     await l2_bridge.consume_mint_credit(L1_TOKEN_ADDRESS, l2_erc1155.contract_address, 2, user1.contract_address).invoke()
#     # Ensure balance of user1 has been increased 
#     assert (await l2_erc1155.balance_of(user1.contract_address).call()).result == (1,)
    
    # starknet.consume_message_from_l2(
    #     from_address=l2_bridge.contract_address,
    #     to_address=L1_GATEWAY_ADDRESS,
    #     payload=payload,
    # )