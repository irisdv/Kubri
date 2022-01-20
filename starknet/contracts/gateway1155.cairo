%lang starknet
%builtins pedersen range_check

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.messages import send_message_to_l1
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.math import assert_not_zero

const BRIDGE_MODE_WITHDRAW = 1

@contract_interface
namespace IBridgedERC1155:
    func safe_is_approved(_from : felt):
    end

    func delete_token_batch(
            owner : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt,
            amounts : felt*):
    end

    func create_token_batch(
            owner : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt,
            amounts : felt*):
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

@storage_var
func get_caller_info() -> (res : felt):
end

@storage_var
func tmp_get_address_erc() -> (res : felt):
end

@storage_var
func tmp_get_from_erc() -> (res : felt):
end

# keep track of the minted L2 ERC1155 bridged to L1
@storage_var
func custody_l2(l2_token_address : felt, token_id : felt, amount : felt) -> (res : felt):
end

# keep track of deposit messages, before minting
@storage_var
func mint_credits(l1_token_address : felt, token_id : felt, amount : felt, owner : felt) -> (
        res : felt):
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
        _l1_token_address : felt, _l2_token_address : felt, _tokens_id_len : felt,
        _tokens_id : felt*, _amounts_len : felt, _amounts : felt*, _l1_owner : felt):
    alloc_locals
    let (local caller_address : felt) = get_caller_address()
    get_caller_info.write(_l2_token_address)
    # check owner of the ERC1155 to bridge is the caller
    IBridgedERC1155.safe_is_approved(contract_address=_l2_token_address, _from=caller_address)

    # check this NFT has not been bridged // is not in custody
    let (current_custody_l2) = read_custody_l2(
        l2_token_address=_l2_token_address,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts)
    assert current_custody_l2 = 0

    # add NFT into custody
    write_custody_l2(
        l2_token_address=_l2_token_address,
        l1_token_address=_l1_token_address,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts)

    let (l1_gateway_address) = l1_gateway.read()

    IBridgedERC1155.delete_token_batch(
        contract_address=_l2_token_address,
        owner=caller_address,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts)

    let payload_size = (4 + (_tokens_id_len * 2))
    let (message_payload : felt*) = alloc()
    assert message_payload[0] = BRIDGE_MODE_WITHDRAW
    assert message_payload[1] = _l1_owner
    assert message_payload[2] = _l1_token_address
    assert message_payload[3] = _l2_token_address

    fill_payload(
        message_payload_len=payload_size,
        message_payload=message_payload,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts,
        index=4)

    send_message_to_l1(
        to_address=l1_gateway_address, payload_size=payload_size, payload=message_payload)

    write_custody_l2(
        l2_token_address=_l2_token_address,
        l1_token_address=0,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts)
    return ()
    # return (payload_size, message_payload)
end

@view
func fill_payload{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        message_payload_len : felt, message_payload : felt*, tokens_id_len : felt,
        tokens_id : felt*, amounts_len : felt, amounts : felt*, index : felt):
    assert tokens_id_len = amounts_len
    if tokens_id_len == 0:
        return ()
    end
    assert message_payload[index] = [tokens_id]
    assert message_payload[index + 1] = [amounts]

    return fill_payload(
        message_payload_len=message_payload_len,
        message_payload=message_payload,
        tokens_id_len=tokens_id_len - 1,
        tokens_id=tokens_id + 1,
        amounts_len=amounts_len - 1,
        amounts=amounts + 1,
        index=index + 2)
end
# passed function in view for testing purposes
@view
func read_custody_l2{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        l2_token_address : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt,
        amounts : felt*) -> (res : felt):
    assert tokens_id_len = amounts_len
    if tokens_id_len == 0:
        return (0)
    end

    let (current_custody_l2) = custody_l2.read(l2_token_address, [tokens_id], [amounts])

    assert current_custody_l2 = 0

    return read_custody_l2(
        l2_token_address=l2_token_address,
        tokens_id_len=tokens_id_len - 1,
        tokens_id=tokens_id + 1,
        amounts_len=amounts_len - 1,
        amounts=amounts + 1)
end

func write_custody_l2{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        l2_token_address : felt, l1_token_address : felt, tokens_id_len : felt, tokens_id : felt*,
        amounts_len : felt, amounts : felt*):
    assert tokens_id_len = amounts_len
    if tokens_id_len == 0:
        return ()
    end
    custody_l2.write(l2_token_address, [tokens_id], [amounts], value=l1_token_address)

    return write_custody_l2(
        l2_token_address=l2_token_address,
        l1_token_address=l1_token_address,
        tokens_id_len=tokens_id_len - 1,
        tokens_id=tokens_id + 1,
        amounts_len=amounts_len - 1,
        amounts=amounts + 1)
end

func write_mint_credit{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        l2_token_address : felt, l1_token_address : felt, tokens_id_len : felt, tokens_id : felt*,
        amounts_len : felt, amounts : felt*, owner : felt):
    assert tokens_id_len = amounts_len
    if tokens_id_len == 0:
        return ()
    end
    mint_credits.write(
        l1_token_address=l1_token_address,
        token_id=[tokens_id],
        amount=[amounts],
        owner=owner,
        value=l2_token_address)

    return write_mint_credit(
        l2_token_address=l2_token_address,
        l1_token_address=l1_token_address,
        tokens_id_len=tokens_id_len - 1,
        tokens_id=tokens_id + 1,
        amounts_len=amounts_len - 1,
        amounts=amounts + 1,
        owner=owner)
end

func read_mint_credit{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        l2_token_address : felt, l1_token_address : felt, tokens_id_len : felt, tokens_id : felt*,
        amounts_len : felt, amounts : felt*, owner : felt) -> (res : felt):
    assert tokens_id_len = amounts_len
    if tokens_id_len == 0:
        return (l2_token_address)
    end
    let (res) = mint_credits.read(
        l1_token_address=l1_token_address, token_id=[tokens_id], amount=[amounts], owner=owner)

    assert res = l2_token_address

    return read_mint_credit(
        l2_token_address=l2_token_address,
        l1_token_address=l1_token_address,
        tokens_id_len=tokens_id_len - 1,
        tokens_id=tokens_id + 1,
        amounts_len=amounts_len - 1,
        amounts=amounts + 1,
        owner=owner)
end

# @view
# func get_mint_credit{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
#         _l1_token_address : felt, _token_id : felt, _owner : felt) -> (res : felt):
#     let (res) = mint_credits.read(
#         l1_token_address=_l1_token_address, token_id=_token_id, owner=_owner)
#     return (res)
# end

# tries to consume mint credit
@external
func consume_mint_credit{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        _l1_token_address : felt, _l2_token_address : felt, _tokens_id_len : felt,
        _tokens_id : felt*, _amounts_len : felt, _amounts : felt*, _l2_owner : felt):
    alloc_locals
    tmp_get_address_erc.write(_l2_owner)
    let (local tmp_l2_token_address : felt) = read_mint_credit(
        l2_token_address=_l2_token_address,
        l1_token_address=_l1_token_address,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts,
        owner=_l2_owner)

    assert_not_zero(tmp_l2_token_address)

    let (l1_token_address) = IBridgedERC1155.get_l1_address(contract_address=_l2_token_address)

    assert l1_token_address = _l1_token_address

    IBridgedERC1155.create_token_batch(
        contract_address=_l2_token_address,
        owner=_l2_owner,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts)

    write_custody_l2(
        l2_token_address=_l2_token_address,
        l1_token_address=_l1_token_address,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts)

    write_mint_credit(
        l2_token_address=0,
        l1_token_address=_l1_token_address,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts,
        owner=_l2_owner)

    return ()
end

# receive and handle deposit messages
@l1_handler
func bridge_from_mainnet{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        from_address : felt, _owner : felt, _l1_token_address : felt, _l2_token_address : felt,
        _tokens_id_len : felt, _tokens_id : felt*, _amounts_len : felt, _amounts : felt*):
    let (res) = l1_gateway.read()
    assert from_address = res

    let (current_custody_l2) = read_custody_l2(
        l2_token_address=_l2_token_address,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts)
    assert current_custody_l2 = 0
    tmp_get_from_erc.write(_owner)
    write_mint_credit(
        l2_token_address=_l2_token_address,
        l1_token_address=_l1_token_address,
        tokens_id_len=_tokens_id_len,
        tokens_id=_tokens_id,
        amounts_len=_amounts_len,
        amounts=_amounts,
        owner=_owner)

    return ()
end

# ############ test function ###################@
@view
func get_l1_gateway{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        res : felt):
    let (res) = l1_gateway.read()
    return (res)
end
@view
func get_caller_gateway{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        res : felt):
    let (res) = get_caller_info.read()
    return (res)
end

@view
func get_custody_l2{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        _l2_token_address : felt, _token_id : felt, _amount : felt) -> (current_custody : felt):
    let (current_custody) = custody_l2.read(
        l2_token_address=_l2_token_address, token_id=_token_id, amount=_amount)
    return (current_custody)
end

@view
func get_tmp_adderc{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        address : felt):
    let (address) = tmp_get_address_erc.read()
    return (address)
end

@view
func get_tmp_from{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        address : felt):
    let (address) = tmp_get_from_erc.read()
    return (address)
end
