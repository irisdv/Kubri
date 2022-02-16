%lang starknet
%builtins pedersen range_check ecdsa

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.math import (
    assert_nn_le, assert_not_equal, assert_not_zero, assert_le, assert_lt)
from starkware.cairo.common.alloc import alloc

@storage_var
func balances(owner : felt, token_id : felt) -> (res : felt):
end

@storage_var
func operator_approvals(owner : felt, operator : felt) -> (res : felt):
end

@storage_var
func l1_address() -> (res : felt):
end

@storage_var
func initialized() -> (res : felt):
end

@storage_var
func gateway_address() -> (res : felt):
end

@storage_var
func max_mint() -> (res : felt):
end

@storage_var
func _amount_minted(owner : felt) -> (res : felt):
end

@storage_var
func total_amount(owner : felt) -> (res : felt):
end

@storage_var
func total_tokensId(owner : felt) -> (res : felt):
end

@storage_var
func get_tokenId(owner : felt, index : felt) -> (res : felt):
end

@storage_var
func _totalSupply(id : felt) -> (res : felt):
end

# ERC1155 returns the same URI for all token types.
# We use struct as felt can only store string whose length is at most 31 characters
# Client calling the function must replace the '{id}' substring with the actual token type ID
struct TokenUri:
    member a : felt
    member b : felt
end

@storage_var
func _next_token_id() -> (res : felt):
end

@storage_var
func _uri(token_id : felt) -> (res : TokenUri):
end

@storage_var
func minted() -> (res : felt):
end

@constructor
func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        _gateway_address : felt, address_l1 : felt):
    let (_initialized) = initialized.read()
    assert _initialized = 0

    gateway_address.write(_gateway_address)
    l1_address.write(address_l1)
    # max_mint.write(max)
    initialized.write(1)

    return ()
end

#
# Initializer
#
@external
func initialize_batch{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        tokens_id_len : felt, tokens_id : felt*, amounts_len : felt, amounts : felt*):
    let (_minted) = minted.read()
    assert _minted = 0

    let (sender) = get_caller_address()

    _mint_batch(sender, tokens_id_len, tokens_id, amounts_len, amounts)

    minted.write(1)

    return ()
end

@external
func initialize_nft_batch{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        sender : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt,
        amounts : felt*):
    # alloc_locals
    # let (_minted) = minted.read()
    # assert _minted = 0
    # write_total_amount(sender, amounts_len, amounts)
    # let (_total_amount) = total_amount.read(sender)
    # let (max) = max_mint.read()
    # assert_lt(_total_amount, max)

    _mint_batch(sender, tokens_id_len, tokens_id, amounts_len, amounts)
    # minted.write(1)
    write_tokenId(sender, tokens_id_len, tokens_id)

    # let (_mint_id) = _next_token_id.read()
    # _next_token_id.write(_mint_id + tokens_id_len)

    return ()
end

func create_uri{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        tokens_id_len : felt, tokens_id : felt*):
    if tokens_id_len == 0:
        return ()
    end

    let (_mint_id) = _next_token_id.read()

    tokens_id[0] = _mint_id

    # update _next_token_id
    _next_token_id.write(_mint_id + 1)

    return create_uri(tokens_id_len=tokens_id_len - 1, tokens_id=tokens_id + 1)
end

@external
func _set_uri{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        tokens_id : felt, uri_len : felt, uri : felt*):
    alloc_locals
    assert_not_zero(uri_len)
    local newstruct : TokenUri = TokenUri(uri[0], uri[1])
    _uri.write(tokens_id, newstruct)
    return ()
end

func _mint{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        to : felt, token_id : felt, amount : felt) -> ():
    assert_not_zero(to)
    let (max) = max_mint.read()
    # let (already_mint) = _amount_minted.read(owner=to)
    # assert_lt(already_mint + amount, max)
    _before_token_transfer(_from=0, to=to, id=token_id, amount=amount)

    let (res) = balances.read(owner=to, token_id=token_id)
    balances.write(to, token_id, res + amount)
    # _amount_minted.write(owner=to, already_mint + amount)
    return ()
end

func _mint_batch{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        to : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt,
        amounts : felt*) -> ():
    assert_not_zero(to)
    assert tokens_id_len = amounts_len

    if tokens_id_len == 0:
        return ()
    end
    _mint(to, tokens_id[0], amounts[0])
    return _mint_batch(
        to=to,
        tokens_id_len=tokens_id_len - 1,
        tokens_id=tokens_id + 1,
        amounts_len=amounts_len - 1,
        amounts=amounts + 1)
end

func _before_token_transfer{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        _from : felt, to : felt, id : felt, amount : felt) -> ():
    alloc_locals
    let (local res : felt) = _totalSupply.read(id)
    if _from == to:
        return ()
    end
    if _from == 0:
        # tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        # tempvar syscall_ptr : felt* = syscall_ptr
        _totalSupply.write(id, res + amount)
    else:
        if to == 0:
            _totalSupply.write(id, res - amount)
        else:
            return ()
        end
    end
    return ()
end

#
# Getters
#

# Returns the same URI for all tokens type ID
# Client calling the function must replace the {id} substring with the actual token type ID
@view
func uri{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(token_id : felt) -> (
        res : TokenUri):
    let (res) = _uri.read(token_id)
    return (res)
end

@view
func balance_of{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        owner : felt, token_id : felt) -> (res : felt):
    assert_not_zero(owner)
    let (res) = balances.read(owner=owner, token_id=token_id)
    return (res)
end

@view
func balance_of_batch{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        owners_len : felt, owners : felt*, tokens_id_len : felt, tokens_id : felt*) -> (
        res_len : felt, res : felt*):
    assert owners_len = tokens_id_len
    alloc_locals
    local max = owners_len
    let (local ret_array : felt*) = alloc()
    local ret_index = 0
    populate_balance_of_batch(owners, tokens_id, ret_array, ret_index, max)
    return (max, ret_array)
end

func populate_balance_of_batch{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        owners : felt*, tokens_id : felt*, rett : felt*, ret_index : felt, max : felt):
    alloc_locals
    if ret_index == max:
        return ()
    end
    let (local retval0 : felt) = balances.read(owner=owners[0], token_id=tokens_id[0])
    rett[0] = retval0
    populate_balance_of_batch(owners + 1, tokens_id + 1, rett + 1, ret_index + 1, max)
    return ()
end

func populate_tokens{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        owner : felt, rett : felt*, idx : felt) -> (res : felt*):
    if idx == -1:
        return (rett)
    end
    let (token_id) = get_tokenId.read(owner, idx)
    rett[0] = token_id
    return populate_tokens(owner=owner, rett=rett + 1, idx=idx - 1)
end

# @external
@view
func get_all_token_by_owner{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        owner : felt) -> (tokens_id_len : felt, tokens_id : felt*):
    alloc_locals
    let (local tokens_id : felt*) = alloc()
    let (nb_tokensId) = total_tokensId.read(owner=owner)
    let (nv) = populate_tokens(owner, tokens_id, nb_tokensId - 1)
    return (nv - tokens_id, tokens_id)
end

func write_tokenId{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        owner : felt, tokens_id_len : felt, tokens_id : felt*):
    alloc_locals
    if tokens_id_len == 0:
        return ()
    end
    let (balance) = balances.read(owner, [tokens_id])
    assert_not_zero(balance)
    let (idx) = total_tokensId.read(owner)
    if idx == 0:
        get_tokenId.write(owner, idx, [tokens_id])
        total_tokensId.write(owner, idx + 1)
        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
    else:
        check_tokenId_exist(owner, idx - 1, [tokens_id])
        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
    end
    return write_tokenId(owner=owner, tokens_id_len=tokens_id_len - 1, tokens_id=tokens_id + 1)
end

func swap_tokenId{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        owner : felt, idx : felt):
    let (idx_end) = total_tokensId.read(owner=owner)
    if idx == idx_end:
        total_tokensId.write(owner, idx_end - 1)
        tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
        return ()
    end
    let (newId) = get_tokenId.read(owner, idx + 1)
    get_tokenId.write(owner, idx, newId)
    return swap_tokenId(owner=owner, idx=idx + 1)
end

func delete_tokenId{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        owner : felt, idx : felt):
    alloc_locals
    local pedersen_ptr : HashBuiltin* = pedersen_ptr
    if idx == -1:
        return ()
    end
    let (token_id) = get_tokenId.read(owner, idx)
    let (balance) = balances.read(owner, token_id)
    tempvar syscall_ptr : felt* = syscall_ptr
    tempvar range_check_ptr = range_check_ptr
    if balance == 0:
        swap_tokenId(owner, idx)
        tempvar syscall_ptr : felt* = syscall_ptr
        tempvar range_check_ptr = range_check_ptr
    end
    return delete_tokenId(owner=owner, idx=idx - 1)
end

func check_tokenId_exist{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        owner : felt, idx : felt, token_id : felt):
    let (exist) = get_tokenId.read(owner, idx)
    if exist == token_id:
        return ()
    end
    if idx == 0:
        let (oldIdx) = total_tokensId.read(owner=owner)
        get_tokenId.write(owner, oldIdx, token_id)
        total_tokensId.write(owner, oldIdx + 1)
        return ()
    end
    return check_tokenId_exist(owner=owner, idx=idx - 1, token_id=token_id)
end

#
# Approvals
#

@view
func is_approved_for_all{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        account : felt, operator : felt) -> (res : felt):
    let (res) = operator_approvals.read(owner=account, operator=operator)
    return (res=res)
end

@external
func set_approval_for_all{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        operator : felt, approved : felt):
    let (account) = get_caller_address()
    assert_not_equal(account, operator)
    # ensure approved is a boolean (0 or 1)
    assert approved * (1 - approved) = 0
    operator_approvals.write(account, operator, approved)
    return ()
end

#
# Transfer from
#

@external
func safe_transfer_from{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        _from : felt, to : felt, token_id : felt, amount : felt):
    _assert_is_owner_or_approved(_from)
    _transfer_from(_from, to, token_id, amount)
    return ()
end

@external
func safe_batch_transfer_from{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        _from : felt, to : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt,
        amounts : felt*):
    _assert_is_owner_or_approved(_from)
    _batch_transfer_from(_from, to, tokens_id_len, tokens_id, amounts_len, amounts)
    return ()
end

@external
func safe_is_approved{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        _from : felt):
    _assert_is_owner_or_approved(_from)
    return ()
end

func _transfer_from{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        sender : felt, recipient : felt, token_id : felt, amount : felt):
    alloc_locals
    # check recipient != 0
    assert_not_zero(recipient)

    # validate sender has enough funds
    let (sender_balance) = balances.read(owner=sender, token_id=token_id)
    assert_nn_le(amount, sender_balance)
    _before_token_transfer(sender, recipient, token_id, amount)

    # substract from sender
    balances.write(sender, token_id, sender_balance - amount)

    # add to recipient
    let (res) = balances.read(owner=recipient, token_id=token_id)
    balances.write(recipient, token_id, res + amount)
    return ()
end

func _batch_transfer_from{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        _from : felt, to : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt,
        amounts : felt*):
    assert tokens_id_len = amounts_len
    assert_not_zero(to)

    if tokens_id_len == 0:
        return ()
    end
    _transfer_from(_from, to, [tokens_id], [amounts])
    return _batch_transfer_from(
        _from=_from,
        to=to,
        tokens_id_len=tokens_id_len - 1,
        tokens_id=tokens_id + 1,
        amounts_len=amounts_len - 1,
        amounts=amounts + 1)
end

# function to test ERC1155 requirement : require(from == _msgSender() || isApprovedForAll(from, _msgSender())
func _assert_is_owner_or_approved{
        pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(address : felt):
    let (caller) = get_caller_address()
    if caller == address:
        return ()
    end

    let (operator_is_approved) = is_approved_for_all(account=address, operator=caller)
    assert operator_is_approved = 1
    return ()
end

#
# Burn
#

@external
func _burn{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        _from : felt, token_id : felt, amount : felt):
    assert_not_zero(_from)

    let (from_balance) = balance_of(_from, token_id)
    assert_le(amount, from_balance)
    balances.write(_from, token_id, from_balance - amount)
    _before_token_transfer(_from=_from, to=0, id=token_id, amount=amount)

    return ()
end

@external
func _burn_batch{pedersen_ptr : HashBuiltin*, syscall_ptr : felt*, range_check_ptr}(
        _from : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt, amounts : felt*):
    assert_not_zero(_from)

    assert tokens_id_len = amounts_len
    if tokens_id_len == 0:
        # tempvar pedersen_ptr : HashBuiltin* = pedersen_ptr
        return ()
    end
    _burn(_from, [tokens_id], [amounts])
    return _burn_batch(
        _from=_from,
        tokens_id_len=tokens_id_len - 1,
        tokens_id=tokens_id + 1,
        amounts_len=amounts_len - 1,
        amounts=amounts + 1)
end

@external
func create_token_batch{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        owner : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt, amounts : felt*):
    let (caller) = get_caller_address()
    let (_gateway_address) = gateway_address.read()
    assert caller = _gateway_address

    write_total_amount(owner, amounts_len, amounts)
    let (_total_amount) = total_amount.read(owner)
    let (max) = max_mint.read()
    assert_lt(_total_amount, max)

    _mint_batch(owner, tokens_id_len, tokens_id, amounts_len, amounts)
    write_tokenId(owner, tokens_id_len, tokens_id)
    return ()
end

@external
func delete_token_batch{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        owner : felt, tokens_id_len : felt, tokens_id : felt*, amounts_len : felt, amounts : felt*):
    let (caller) = get_caller_address()
    let (_gateway_address) = gateway_address.read()
    assert caller = _gateway_address

    _burn_batch(owner, tokens_id_len, tokens_id, amounts_len, amounts)
    let (idx) = total_tokensId.read(owner)
    delete_tokenId(owner, idx - 1)
    return ()
end

# # functions for testing purposes

@view
func get_l1_address{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        address : felt):
    let (address) = l1_address.read()
    return (address)
end

@view
func get_gateway_address{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        res : felt):
    let (res) = gateway_address.read()
    return (res)
end
@view
func get_next_token_id{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
        res : felt):
    let (res) = _next_token_id.read()
    return (res)
end

@view
func write_total_amount{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        owner : felt, amounts_len : felt, amounts : felt*):
    if amounts_len == 0:
        return ()
    end
    let (res) = total_amount.read(owner)
    total_amount.write(owner, amounts[0] + res)
    return write_total_amount(owner=owner, amounts_len=amounts_len - 1, amounts=amounts + 1)
end
