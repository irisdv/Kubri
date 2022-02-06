import os
import pytest
import asyncio
from starkware.starknet.testing.starknet import Starknet
from starkware.starknet.testing.contract import StarknetContract
from starkware.starkware_utils.error_handling import StarkException
from starkware.starknet.definitions.error_codes import StarknetErrorCode

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
async def user2(starknet: Starknet) -> StarknetContract:
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
            200
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

# @pytest.mark.asyncio
# async def test_approvals(
#     starknet: Starknet,
#     l2_bridge: StarknetContract,
#     l2_erc1155: StarknetContract,
#     auth_user: StarknetContract,
#     user1: StarknetContract,
#     user2: StarknetContract
# ):
#     assert (await l2_erc1155.get_next_token_id().call()).result == (0,)

#     # mint batch of NFTs for user1
#     await l2_erc1155.initialize_nft_batch(user1.contract_address, [1,2], [50, 100] ).invoke(user1.contract_address)
#     # check we have right value for get_next_token_id storage var
#     assert (await l2_erc1155.get_next_token_id().call()).result == (2,)

#     # get balance of user1 for tokens_ids 1 & 2
#     execution_info = await l2_erc1155.balance_of(user1.contract_address, 1).call()
#     assert execution_info.result == (50,)
#     execution_info = await l2_erc1155.balance_of(user1.contract_address, 2).call()
#     assert execution_info.result == (100,)
#     # get_all_token_by_owner for user1
#     execution_info = await l2_erc1155.get_all_token_by_owner(user1.contract_address).call()
#     assert execution_info.result == ([2, 1],)

#     # check and set approval for user1
#     assert (await l2_erc1155.is_approved_for_all(user1.contract_address, l2_bridge.contract_address).call()).result == (0,)
#     await l2_erc1155.set_approval_for_all(l2_bridge.contract_address, 1).invoke(user1.contract_address)
#     assert (await l2_erc1155.is_approved_for_all(user1.contract_address, l2_bridge.contract_address).call()).result == (1,)
    
#     # user1 can transfer his tokens to user2 and auth_user
#     await l2_erc1155.safe_batch_transfer_from(user1.contract_address, auth_user.contract_address, [1], [50] ).invoke(user1.contract_address)
#     execution_info = await l2_erc1155.balance_of(auth_user.contract_address, 1).call()
#     assert execution_info.result == (50,)
#     execution_info = await l2_erc1155.balance_of(user1.contract_address, 1).call()
#     assert execution_info.result == (0,)
#     await l2_erc1155.safe_batch_transfer_from(user1.contract_address, user2.contract_address, [2], [100] ).invoke(user1.contract_address)
#     execution_info = await l2_erc1155.balance_of(user1.contract_address, 2).call()
#     assert execution_info.result == (0,)
#     execution_info = await l2_erc1155.balance_of(user2.contract_address, 2).call()
#     assert execution_info.result == (100,)

#     # mint batch of NFTs for user2
#     await l2_erc1155.initialize_nft_batch(user2.contract_address, [3], [20] ).invoke(user2.contract_address)
#     execution_info = await l2_erc1155.balance_of(user2.contract_address, 3).call()
#     assert execution_info.result == (20,)

#     # check user1 which has approval, can't transfer user2's tokens_id = 3
#     try:
#         await l2_erc1155.safe_batch_transfer_from(user2.contract_address, user1.contract_address, [3], [20] ).invoke(user1.contract_address)
#         assert False
#     except StarkException as err:
#         _, error = err.args
#         assert error['code'] == StarknetErrorCode.TRANSACTION_FAILED
#     # balances of user1 & user2 remain the same
#     execution_info = await l2_erc1155.balance_of(user2.contract_address, 3).call()
#     assert execution_info.result == (20,)
#     execution_info = await l2_erc1155.balance_of(user1.contract_address, 3).call()
#     assert execution_info.result == (0,)

@pytest.mark.asyncio
async def test_minting_with_uri(
    starknet: Starknet,
    l2_bridge: StarknetContract,
    l2_erc1155: StarknetContract,
    auth_user: StarknetContract,
    user1: StarknetContract,
    user2: StarknetContract
):
    assert (await l2_erc1155.get_next_token_id().call()).result == (0,)

    uri = [int.from_bytes("bafybeifvckoqkr7wmk55ttuxg2ry".encode("ascii"), 'big'), int.from_bytes("tfojrfihiqoj5h5wjt5jtkqwnkxbie".encode("ascii"), 'big')]

    # user1 mints batch of NFTs with uri
    await l2_erc1155.mint_nft_batch_with_uri(user1.contract_address, [1,2], [50, 100], uri).invoke(user1.contract_address)
    # ensure we have the right balances 
    execution_info = await l2_erc1155.balance_of(user1.contract_address, 1).call()
    assert execution_info.result == (50,)
    execution_info = await l2_erc1155.balance_of(user1.contract_address, 2).call()
    assert execution_info.result == (100,)
    # get_all_token_by_owner for user1
    execution_info = await l2_erc1155.get_all_token_by_owner(user1.contract_address).call()
    assert execution_info.result == ([2, 1],)

    # check URI have been saved correctly
    execution_info = await l2_erc1155.uri(1).call(user1.contract_address)
    assert execution_info.result.res.a == int.from_bytes("bafybeifvckoqkr7wmk55ttuxg2ry".encode("ascii"), 'big')
    assert execution_info.result.res.b == int.from_bytes("tfojrfihiqoj5h5wjt5jtkqwnkxbie".encode("ascii"), 'big')

    execution_info = await l2_erc1155.uri(2).call(auth_user.contract_address)
    assert execution_info.result.res.a == int.from_bytes("bafybeifvckoqkr7wmk55ttuxg2ry".encode("ascii"), 'big')
    assert execution_info.result.res.b == int.from_bytes("tfojrfihiqoj5h5wjt5jtkqwnkxbie".encode("ascii"), 'big')

    # check we get the right array of uri for a given array of token_ids
    # execution_info = await l2_erc1155.get_uri([1,2]).call()
    # assert execution_info.result.res == ['a', 'b']

    # uri = {'bafybeifvckoqkr7wmk55ttuxg2rytf', 'ojrfihiqoj5h5wjt5jtkqwnkxbie'}
    # ( int.from_bytes("bafybeifvckoqkr7wmk55ttuxg2ry".encode("ascii"), 'big'), int.from_bytes("tfojrfihiqoj5h5wjt5jtkqwnkxbie".encode("ascii"), 'big'))

# bridge NFTs minted to L1
@pytest.mark.asyncio
async def test_bridge_to_l1(
    starknet: Starknet,
    l2_bridge: StarknetContract,
    l2_erc1155: StarknetContract,
    auth_user: StarknetContract,
    user1: StarknetContract,
    user2: StarknetContract
):
    assert (await l2_erc1155.get_next_token_id().call()).result == (0,)
    assert (await l2_erc1155.get_gateway_address().call()).result == (l2_bridge.contract_address,)

    # assert (await l2_bridge.read_custody_l2(l2_erc1155.contract_address, [1,2], [50, 100]).call()).result == (0,)
    # test bridge to mainnet function 
    # await l2_bridge.bridge_to_mainnet(L1_TOKEN_ADDRESS,l2_erc1155.contract_address, [1,2], [50,100], L1_OWNER).invoke(auth_user.contract_address)
    
    # check NFTs bridged are in custody in storage_var
    # assert (await l2_bridge.get_custody_l2(l2_erc1155.contract_address, 1, 50).call()).result == (L1_TOKEN_ADDRESS,)
    # assert (await l2_bridge.get_custody_l2(l2_erc1155.contract_address, 2, 100).call()).result == (L1_TOKEN_ADDRESS,)

    # check NFTs have been burnt 
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