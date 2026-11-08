#![no_std]
//! RE Global ownership registry.
//!
//! An append-only public record of property ownership. Every entry ties one signed RE Global contract (by the
//! SHA-256 of its text) to a property and to a buyer reference. Only the platform admin can write. Nothing in the
//! registry can be changed or deleted: a later sale or a cancellation is a new entry that points at the entry it
//! replaces. No personal data is stored: the buyer is a 32-byte reference (a SHA-256 the platform computes), and
//! the contract text itself stays on the platform.
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error, symbol_short, Address, BytesN, Env,
    String, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    DuplicateContract = 3,
    BadInput = 4,
    UnknownEntry = 5,
    AlreadyReplaced = 6,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Key {
    Admin,
    Count,
    Entry(u32),
    ByHash(BytesN<32>),
    /// The latest active entry of a property (the current owner of a whole property).
    Current(String),
}

/// One ownership entry. `kind` is one of: buy, rent, invest, tokenized (the same words the platform uses).
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Entry {
    pub id: u32,
    pub property_id: String,
    pub buyer_ref: BytesN<32>,
    pub contract_hash: BytesN<32>,
    pub kind: Symbol,
    /// Number of shares for share purchases; 0 for a whole property, a rent or a stay.
    pub shares: u32,
    pub ledger: u32,
    pub timestamp: u64,
    /// Id of the entry this one replaced (a resale or a transfer), or u32::MAX when it replaced none.
    pub replaces: u32,
    /// Set once a later entry replaces this one.
    pub replaced_by: u32,
}

pub const NONE: u32 = u32::MAX;
const MAX_PROPERTY_ID: u32 = 128;

/// Published on every entry so indexers and explorers can follow the registry.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Recorded {
    #[topic]
    pub property_id: String,
    pub id: u32,
    pub contract_hash: BytesN<32>,
}

#[contract]
pub struct OwnershipRegistry;

fn admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&Key::Admin)
        .unwrap_or_else(|| panic_with_error!(env, Error::NotInitialized))
}

fn count(env: &Env) -> u32 {
    env.storage().instance().get(&Key::Count).unwrap_or(0)
}

fn kind_ok(kind: &Symbol) -> bool {
    *kind == symbol_short!("buy")
        || *kind == symbol_short!("rent")
        || *kind == symbol_short!("invest")
        || *kind == symbol_short!("tokenized")
}

#[contractimpl]
impl OwnershipRegistry {
    /// One-time setup: the platform account that is allowed to write entries.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&Key::Admin) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }
        env.storage().instance().set(&Key::Admin, &admin);
        env.storage().instance().set(&Key::Count, &0u32);
    }

    /// Adds an entry for a signed contract. `replaces` is the id of the entry it takes over from (resale or
    /// transfer), or u32::MAX for a first sale. A contract hash can be recorded only once.
    pub fn record(
        env: Env,
        property_id: String,
        buyer_ref: BytesN<32>,
        contract_hash: BytesN<32>,
        kind: Symbol,
        shares: u32,
        replaces: u32,
    ) -> u32 {
        admin(&env).require_auth();
        if property_id.len() == 0 || property_id.len() > MAX_PROPERTY_ID || !kind_ok(&kind) {
            panic_with_error!(&env, Error::BadInput);
        }
        if env.storage().persistent().has(&Key::ByHash(contract_hash.clone())) {
            panic_with_error!(&env, Error::DuplicateContract);
        }
        let id = count(&env);

        if replaces != NONE {
            let mut old: Entry = env
                .storage()
                .persistent()
                .get(&Key::Entry(replaces))
                .unwrap_or_else(|| panic_with_error!(&env, Error::UnknownEntry));
            if old.replaced_by != NONE {
                panic_with_error!(&env, Error::AlreadyReplaced);
            }
            if old.property_id != property_id {
                panic_with_error!(&env, Error::BadInput);
            }
            old.replaced_by = id;
            env.storage().persistent().set(&Key::Entry(replaces), &old);
        }

        let entry = Entry {
            id,
            property_id: property_id.clone(),
            buyer_ref,
            contract_hash: contract_hash.clone(),
            kind: kind.clone(),
            shares,
            ledger: env.ledger().sequence(),
            timestamp: env.ledger().timestamp(),
            replaces,
            replaced_by: NONE,
        };
        env.storage().persistent().set(&Key::Entry(id), &entry);
        env.storage().persistent().set(&Key::ByHash(contract_hash.clone()), &id);
        if kind == symbol_short!("buy") {
            env.storage().persistent().set(&Key::Current(property_id.clone()), &id);
        }
        env.storage().instance().set(&Key::Count, &(id + 1));
        Recorded { property_id, id, contract_hash }.publish(&env);
        id
    }

    pub fn get(env: Env, id: u32) -> Entry {
        env.storage()
            .persistent()
            .get(&Key::Entry(id))
            .unwrap_or_else(|| panic_with_error!(&env, Error::UnknownEntry))
    }

    /// The entry of a contract fingerprint, so anyone can check "is this contract on the registry?".
    pub fn by_hash(env: Env, contract_hash: BytesN<32>) -> Option<Entry> {
        let id: Option<u32> = env.storage().persistent().get(&Key::ByHash(contract_hash));
        id.map(|i| Self::get(env, i))
    }

    /// The current whole-property sale entry (the latest `buy`), if any.
    pub fn current(env: Env, property_id: String) -> Option<Entry> {
        let id: Option<u32> = env.storage().persistent().get(&Key::Current(property_id));
        id.map(|i| Self::get(env, i))
    }

    pub fn count(env: Env) -> u32 {
        count(&env)
    }

    pub fn admin(env: Env) -> Address {
        admin(&env)
    }
}

#[cfg(test)]
mod test;
