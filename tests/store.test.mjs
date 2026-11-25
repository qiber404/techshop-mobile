import assert from 'node:assert/strict';
import test from 'node:test';
import { basketLines, basketTotal, initialStore, salePrice, updateStore } from '../src/store.ts';

const now = '2026-11-25T09:00:00.000Z';
const solo = 10;
const next = (state, action) => {
  const result = updateStore(state, action);
  assert.equal(result.ok, true, JSON.stringify(result));
  return result.state;
};
const add = (state, id, quantity) => next(state, { kind: 'quantity', id, quantity });
const checkout = state => next(state, { kind: 'checkout', now });
const product = (state, id = solo) => state.products.find(item => item.id === id);

test('catalog contains 25 products and preserves SoloCast demo pricing', () => {
  const state = add(initialStore(), solo, 2);
  assert.equal(state.products.length, 25);
  assert.equal(salePrice(product(state)), 2_549_150);
  assert.equal(basketTotal(basketLines(state)), 5_098_300);
});

test('checkout clears the basket and stores historical price, quantity and name', () => {
  const before = add(initialStore(), solo, 2);
  const bought = checkout(before);
  assert.equal(product(before).stock, 7);
  assert.equal(product(bought).stock, 5);
  assert.deepEqual(bought.cart, {});
  assert.deepEqual(bought.orders[0].lines[0], {
    productId: solo, name: 'HyperX SoloCast', quantity: 2, unitPrice: 2_549_150,
  });
  const updated = next(bought, { kind: 'saveProduct', id: solo, product: { ...product(bought), price: 3_999_000 } });
  assert.equal(updated.orders[0].total, 5_098_300);
  assert.equal(salePrice(product(updated)), 3_399_150);
});

test('checkout with insufficient stock leaves every product and cart entry intact', () => {
  const filled = add(add(initialStore(), 1, 1), solo, 3);
  const before = next(filled, { kind: 'saveProduct', id: solo, product: { ...product(filled), stock: 1 } });
  const result = updateStore(before, { kind: 'checkout', now });
  assert.deepEqual(result, { ok: false, error: 'stock' });
  assert.equal(product(before, 1).stock, 8);
  assert.deepEqual(before.cart, { 1: 1, 10: 3 });
  assert.deepEqual(add(before, solo, 2).cart, { 1: 1, 10: 2 });
});

test('a paid cancellation restores stock once and records demo refund', () => {
  const bought = checkout(add(initialStore(), solo, 2));
  const paid = next(bought, { kind: 'pay', id: 1 });
  const cancelled = next(paid, { kind: 'cancel', id: 1 });
  assert.equal(product(cancelled).stock, 7);
  assert.equal(cancelled.orders[0].status, 'cancelled');
  assert.equal(cancelled.orders[0].payment, 'refunded');
  assert.equal(product(next(cancelled, { kind: 'cancel', id: 1 })).stock, 7);
});

test('shipping requires payment and closes customer cancellation', () => {
  const bought = checkout(add(initialStore(), solo, 1));
  const confirmed = next(bought, { kind: 'advance', id: 1 });
  assert.deepEqual(updateStore(confirmed, { kind: 'advance', id: 1 }), { ok: false, error: 'paymentRequired' });
  const shipped = next(next(confirmed, { kind: 'pay', id: 1 }), { kind: 'advance', id: 1 });
  assert.equal(shipped.orders[0].status, 'shipped');
  assert.deepEqual(updateStore(shipped, { kind: 'cancel', id: 1 }), { ok: false, error: 'orderClosed' });
  assert.equal(next(shipped, { kind: 'advance', id: 1 }).orders[0].status, 'completed');
});

test('hidden products leave the basket while past orders and photos remain', () => {
  const purchased = checkout(add(initialStore(), solo, 1));
  const stocked = add(purchased, solo, 1);
  const hidden = next(stocked, { kind: 'visibility', id: solo });
  assert.equal(product(hidden).active, false);
  assert.equal(product(hidden).image, solo);
  assert.deepEqual(hidden.cart, {});
  assert.equal(hidden.orders[0].lines[0].name, product(hidden).name);
  assert.equal(product(next(hidden, { kind: 'visibility', id: solo })).active, true);
});

test('reviews and selected language survive a snapshot round trip', () => {
  const profile = next(initialStore(), { kind: 'profile', buyer: 'Аян' });
  const reviewed = next(profile, { kind: 'review', id: solo, rating: 4, comment: 'Хороший звук', now });
  const localized = next(reviewed, { kind: 'language', language: 'kk' });
  const loaded = JSON.parse(JSON.stringify(localized));
  assert.equal(loaded.language, 'kk');
  assert.equal(loaded.reviews[0].author, 'Аян');
  assert.equal(loaded.reviews[0].rating, 4);
});
