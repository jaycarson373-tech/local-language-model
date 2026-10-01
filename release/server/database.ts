import {DatabaseSync} from "node:sqlite";
import {mkdirSync} from "node:fs";
import {dirname} from "node:path";
export function database(path:string){if(path!==":memory:")mkdirSync(dirname(path),{recursive:true});const db=new DatabaseSync(path);db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");db.exec(`
CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS budget(id INTEGER PRIMARY KEY CHECK(id=1),cleared INTEGER NOT NULL DEFAULT 0 CHECK(cleared>=0),buffer INTEGER NOT NULL DEFAULT 0 CHECK(buffer>=0),overhead INTEGER NOT NULL DEFAULT 0 CHECK(overhead>=0),daily_limit INTEGER NOT NULL DEFAULT 0 CHECK(daily_limit>=0),paused INTEGER NOT NULL DEFAULT 1);
INSERT OR IGNORE INTO budget(id) VALUES(1);
CREATE TABLE IF NOT EXISTS funds(reference TEXT PRIMARY KEY,amount INTEGER NOT NULL CHECK(amount>0),proof TEXT NOT NULL,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS lots(id TEXT PRIMARY KEY,wallet TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('daily','purchased','burn')),available INTEGER NOT NULL CHECK(available>=0),reserved INTEGER NOT NULL DEFAULT 0 CHECK(reserved>=0),expires INTEGER,created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS lots_wallet ON lots(wallet,expires);
CREATE TABLE IF NOT EXISTS ledger(id INTEGER PRIMARY KEY AUTOINCREMENT,wallet TEXT NOT NULL,kind TEXT NOT NULL,available_delta INTEGER NOT NULL,reserved_delta INTEGER NOT NULL,reference TEXT NOT NULL,created INTEGER NOT NULL);
CREATE TRIGGER IF NOT EXISTS ledger_no_update BEFORE UPDATE ON ledger BEGIN SELECT RAISE(ABORT,'Immutable ledger'); END;
CREATE TRIGGER IF NOT EXISTS ledger_no_delete BEFORE DELETE ON ledger BEGIN SELECT RAISE(ABORT,'Immutable ledger'); END;
CREATE TABLE IF NOT EXISTS holds(wallet TEXT PRIMARY KEY,balance TEXT NOT NULL,since INTEGER NOT NULL,evidence_until INTEGER NOT NULL,excluded INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS epochs(id TEXT PRIMARY KEY,pool INTEGER NOT NULL,remaining INTEGER NOT NULL,deadline INTEGER NOT NULL,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS allocations(epoch TEXT NOT NULL REFERENCES epochs(id),wallet TEXT NOT NULL,amount INTEGER NOT NULL,claimed INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(epoch,wallet));
CREATE TABLE IF NOT EXISTS quotes(id TEXT PRIMARY KEY,wallet TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('purchase','burn')),atomic_amount TEXT NOT NULL,credits INTEGER NOT NULL,expires INTEGER NOT NULL,state TEXT NOT NULL DEFAULT 'open',message_hash TEXT,transaction_base64 TEXT,reference TEXT,last_valid_height INTEGER,blockhash TEXT,fee INTEGER,signature TEXT,mint TEXT,decimals INTEGER,recipient TEXT,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS receipts(signature TEXT PRIMARY KEY,quote TEXT UNIQUE NOT NULL REFERENCES quotes(id),kind TEXT NOT NULL,wallet TEXT NOT NULL,credits INTEGER NOT NULL,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS api_keys(id TEXT PRIMARY KEY,wallet TEXT NOT NULL,name TEXT NOT NULL,hash TEXT UNIQUE NOT NULL,cap INTEGER,spent INTEGER NOT NULL DEFAULT 0,reserved INTEGER NOT NULL DEFAULT 0,revoked INTEGER NOT NULL DEFAULT 0,last_used INTEGER,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY,wallet TEXT NOT NULL,key_id TEXT REFERENCES api_keys(id),conversation TEXT,state TEXT NOT NULL,max_charge INTEGER NOT NULL,charge INTEGER NOT NULL DEFAULT 0,input INTEGER,output INTEGER,provider_id TEXT,stop INTEGER NOT NULL DEFAULT 0,proof TEXT,created INTEGER NOT NULL,updated INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS request_account ON requests(wallet,created);
CREATE TABLE IF NOT EXISTS reservations(request TEXT NOT NULL REFERENCES requests(id),lot TEXT NOT NULL REFERENCES lots(id),amount INTEGER NOT NULL,PRIMARY KEY(request,lot));
CREATE TABLE IF NOT EXISTS nonces(id TEXT PRIMARY KEY,wallet TEXT NOT NULL,message TEXT NOT NULL,expires INTEGER NOT NULL,used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,wallet TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS conversations(id TEXT PRIMARY KEY,wallet TEXT NOT NULL,title TEXT NOT NULL,messages TEXT NOT NULL DEFAULT '[]',created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
INSERT OR IGNORE INTO schema_migrations(version,applied_at) VALUES(1,unixepoch()*1000);
`);const columns=new Set((db.prepare("PRAGMA table_info(quotes)").all() as {name:string}[]).map(x=>x.name));for(const [name,type] of [["mint","TEXT"],["decimals","INTEGER"],["recipient","TEXT"]])if(!columns.has(name))db.exec("ALTER TABLE quotes ADD COLUMN "+name+" "+type);db.prepare("INSERT OR IGNORE INTO schema_migrations VALUES(2,?)").run(Date.now());return db;}
export type DB=ReturnType<typeof database>;
export function row<T>(db:DB,sql:string,...args:(string|number|null)[]){return db.prepare(sql).get(...args) as T|undefined;}
export function rows<T>(db:DB,sql:string,...args:(string|number|null)[]){return db.prepare(sql).all(...args) as T[];}
export function transaction<T>(db:DB,fn:()=>T){db.exec("BEGIN IMMEDIATE");try{const result=fn();db.exec("COMMIT");return result;}catch(e){db.exec("ROLLBACK");throw e;}}
