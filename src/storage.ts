import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { initialStore, type Store } from './store';

let connection: SQLiteDatabase | undefined;

function database() {
  if (connection) return connection;
  const db = openDatabaseSync('techshop.db');
  try {
    db.execSync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS shop_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        snapshot TEXT NOT NULL
      );
    `);
    connection = db;
    return db;
  } catch (error) {
    db.closeSync();
    throw error;
  }
}

export function loadStore(): Store {
  const row = database().getFirstSync<{ snapshot: string }>('SELECT snapshot FROM shop_state WHERE id = 1');
  if (!row) return initialStore();
  const data = JSON.parse(row.snapshot) as { version: number; store: Store };
  if (data.version !== 1 || !Array.isArray(data.store?.products)) throw new Error('Unsupported shop state');
  return data.store;
}

export function saveStore(store: Store) {
  database().runSync(
    'INSERT INTO shop_state (id, snapshot) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET snapshot = excluded.snapshot',
    JSON.stringify({ version: 1, store }),
  );
}
