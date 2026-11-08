use super::*;
use soroban_sdk::{testutils::Address as _, Env};

fn setup() -> (Env, OwnershipRegistryClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(OwnershipRegistry, ());
    let client = OwnershipRegistryClient::new(&env, &id);
    client.init(&Address::generate(&env));
    (env, client)
}

fn b(env: &Env, n: u8) -> BytesN<32> {
    BytesN::from_array(env, &[n; 32])
}

#[test]
fn records_and_reads_back() {
    let (env, c) = setup();
    let id = c.record(&String::from_str(&env, "villa-1"), &b(&env, 1), &b(&env, 9), &symbol_short!("buy"), &0, &NONE);
    assert_eq!(id, 0);
    assert_eq!(c.count(), 1);
    let e = c.get(&0);
    assert_eq!(e.property_id, String::from_str(&env, "villa-1"));
    assert_eq!(e.contract_hash, b(&env, 9));
    assert_eq!(e.replaced_by, NONE);
    assert_eq!(c.by_hash(&b(&env, 9)).unwrap().id, 0);
    assert_eq!(c.current(&String::from_str(&env, "villa-1")).unwrap().id, 0);
    assert!(c.by_hash(&b(&env, 7)).is_none());
}

#[test]
fn a_contract_can_only_be_recorded_once() {
    let (env, c) = setup();
    c.record(&String::from_str(&env, "p"), &b(&env, 1), &b(&env, 9), &symbol_short!("buy"), &0, &NONE);
    let r = c.try_record(&String::from_str(&env, "p"), &b(&env, 2), &b(&env, 9), &symbol_short!("buy"), &0, &NONE);
    assert_eq!(r.err().unwrap().unwrap(), Error::DuplicateContract.into());
    assert_eq!(c.count(), 1);
}

#[test]
fn a_resale_replaces_the_old_entry_and_cannot_be_replaced_twice() {
    let (env, c) = setup();
    let p = String::from_str(&env, "p");
    c.record(&p, &b(&env, 1), &b(&env, 10), &symbol_short!("buy"), &0, &NONE);
    let second = c.record(&p, &b(&env, 2), &b(&env, 11), &symbol_short!("buy"), &0, &0);
    assert_eq!(second, 1);
    assert_eq!(c.get(&0).replaced_by, 1);
    assert_eq!(c.get(&1).replaces, 0);
    assert_eq!(c.current(&p).unwrap().id, 1);
    let again = c.try_record(&p, &b(&env, 3), &b(&env, 12), &symbol_short!("buy"), &0, &0);
    assert_eq!(again.err().unwrap().unwrap(), Error::AlreadyReplaced.into());
}

#[test]
fn a_replacement_must_be_for_the_same_property_and_an_existing_entry() {
    let (env, c) = setup();
    c.record(&String::from_str(&env, "a"), &b(&env, 1), &b(&env, 10), &symbol_short!("buy"), &0, &NONE);
    let other = c.try_record(&String::from_str(&env, "b"), &b(&env, 2), &b(&env, 11), &symbol_short!("buy"), &0, &0);
    assert_eq!(other.err().unwrap().unwrap(), Error::BadInput.into());
    let ghost = c.try_record(&String::from_str(&env, "a"), &b(&env, 2), &b(&env, 12), &symbol_short!("buy"), &0, &55);
    assert_eq!(ghost.err().unwrap().unwrap(), Error::UnknownEntry.into());
}

#[test]
fn rejects_bad_input() {
    let (env, c) = setup();
    let empty = c.try_record(&String::from_str(&env, ""), &b(&env, 1), &b(&env, 10), &symbol_short!("buy"), &0, &NONE);
    assert_eq!(empty.err().unwrap().unwrap(), Error::BadInput.into());
    let kind = c.try_record(&String::from_str(&env, "p"), &b(&env, 1), &b(&env, 10), &symbol_short!("gift"), &0, &NONE);
    assert_eq!(kind.err().unwrap().unwrap(), Error::BadInput.into());
    assert_eq!(c.count(), 0);
}

#[test]
fn only_the_admin_can_write_and_init_runs_once() {
    let env = Env::default();
    let id = env.register(OwnershipRegistry, ());
    let c = OwnershipRegistryClient::new(&env, &id);
    let admin = Address::generate(&env);
    c.init(&admin);
    assert_eq!(c.admin(), admin);
    assert_eq!(c.try_init(&Address::generate(&env)).err().unwrap().unwrap(), Error::AlreadyInitialized.into());
    // No authorisation is mocked here, so the write is refused.
    assert!(c.try_record(&String::from_str(&env, "p"), &b(&env, 1), &b(&env, 10), &symbol_short!("buy"), &0, &NONE).is_err());
    assert_eq!(c.count(), 0);
}

#[test]
fn rent_and_share_entries_do_not_change_the_current_owner() {
    let (env, c) = setup();
    let p = String::from_str(&env, "p");
    c.record(&p, &b(&env, 1), &b(&env, 10), &symbol_short!("buy"), &0, &NONE);
    c.record(&p, &b(&env, 2), &b(&env, 11), &symbol_short!("rent"), &0, &NONE);
    c.record(&p, &b(&env, 3), &b(&env, 12), &symbol_short!("invest"), &25, &NONE);
    assert_eq!(c.current(&p).unwrap().id, 0);
    assert_eq!(c.get(&2).shares, 25);
}
