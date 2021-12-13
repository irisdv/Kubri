%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.messages import send_message_to_l1
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.math import assert_not_zero

const BRIDGE_MODE_WITHDRAW = 1

@contract_interface
namespace IBridgedERC721:
    func create_token(owner : felt, token_id : felt):
    end

    func delete_token(token_id : felt):
    end

    func owner_of(token_id : felt) -> (owner : felt):
    end

    func get_l1_address() -> (address : felt):
    end
end

# construction guard
@storage_var
func initialized() -> (res : felt):
end

# l1 gateway address
@storage_var
func l1_gateway() -> (res : felt):
end

# keep track of the minted ERC721
@storage_var
func custody(l1_token_address : felt, token_id : felt) -> (res : felt):
end

# keep track of the minted L2 ERC721 bridged to L1
@storage_var
func custody_l2(l2_token_address : felt, token_id : felt) -> (res : felt):
end

# keep track of deposit messages, before minting
@storage_var
func mint_credits(l1_token_address : felt, token_id : felt, owner : felt) -> (res : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        _l1_gateway : felt):
    let (is_initialized) = initialized.read()
    assert is_initialized = 0

    l1_gateway.write(_l1_gateway)

    initialized.write(1)
    return ()
end

# bridge native L2 NFT to mainnet 
@external
func bridge_to_mainnet{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        _l1_token_address : felt, _l2_token_address : felt, _token_id : felt, _l1_owner : felt):
    let (caller_address) = get_caller_address()

    # check owner of the ERC721 to bridge is the caller 
    let (owner) = IBridgedERC721.owner_of(contract_address=_l2_token_address, token_id=_token_id)
    assert caller_address = owner 

    # check this NFT has not been bridged // is not in custody
    let (current_custody_l2) = custody_l2.read(l2_token_address=_l2_token_address, token_id=_token_id)
    assert current_custody_l2 = 0 
    # add NFT into custody
    custody_l2.write(l2_token_address=_l2_token_address, token_id=_token_id, value=_l1_token_address)
    
    let (l1_gateway_address) = l1_gateway.read()

    IBridgedERC721.delete_token(contract_address=_l2_token_address, token_id=_token_id)

    let (message_payload : felt*) = alloc()
    assert message_payload[0] = BRIDGE_MODE_WITHDRAW
    assert message_payload[1] = _l1_owner
    assert message_payload[2] = _l1_token_address
    assert message_payload[3] = _l2_token_address
    assert message_payload[4] = _token_id

    send_message_to_l1(to_address=l1_gateway_address, payload_size=5, payload=message_payload)

    custody_l2.write(l2_token_address=_l2_token_address, token_id=_token_id, value=0)

    return()
end

# bridge back native L2 NFT to Starknet 
# Receive and handle deposit message 
@l1_handler
func bridge_from_mainnet{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        from_address : felt, _owner : felt, _l1_token_address : felt, _l2_token_address : felt,
        _token_id : felt):
    let (res) = l1_gateway.read()
    assert from_address = res

    let (current_custody_l2) = custody_l2.read(l2_token_address=_l2_token_address, token_id=_token_id)
    assert current_custody_l2 = 0

    mint_credits.write(
        l1_token_address=_l1_token_address,
        token_id=_token_id,
        owner=_owner,
        value=_l2_token_address)

    return ()
end

@view
func get_mint_credit{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        _l1_token_address : felt, _token_id : felt, _owner : felt) -> (res : felt):
    let (res) = mint_credits.read(
        l1_token_address=_l1_token_address, token_id=_token_id, owner=_owner)
    return (res)
end

# tries to consume mint credit
@external
func consume_mint_credit{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        _l1_token_address : felt, _l2_token_address : felt, _token_id : felt, _l2_owner):
    let (l2_token_address) = mint_credits.read(
        l1_token_address=_l1_token_address, token_id=_token_id, owner=_l2_owner)

    assert_not_zero(l2_token_address)

    let (l1_token_address) = IBridgedERC721.get_l1_address(contract_address=_l2_token_address)

    assert l1_token_address = _l1_token_address

    IBridgedERC721.create_token(
        contract_address=_l2_token_address, owner=_l2_owner, token_id=_token_id)
    custody.write(l1_token_address=_l1_token_address, token_id=_token_id, value=_l2_token_address)
    mint_credits.write(
        l1_token_address=_l1_token_address, token_id=_token_id, owner=_l2_owner, value=0)

    return ()
end

############# test function ###################@
@view
func get_l1_gateway{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (res : felt):
    let (res) = l1_gateway.read()
    return(res)
end

@view
func get_custody_l2{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        _l2_token_address : felt, _token_id : felt) -> (current_custody : felt):
    let (current_custody) = custody_l2.read(l2_token_address=_l2_token_address, token_id=_token_id)
    return(current_custody)
end