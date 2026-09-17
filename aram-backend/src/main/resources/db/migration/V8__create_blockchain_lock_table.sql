-- ARAM Legal Aid Platform Database Schema V8 - Create Blockchain Lock Table
CREATE TABLE IF NOT EXISTS blockchain_locks (
    id BIGINT PRIMARY KEY,
    lock_name VARCHAR(100) NOT NULL
);

DELETE FROM blockchain_locks WHERE id = 1;
INSERT INTO blockchain_locks (id, lock_name) VALUES (1, 'BLOCKCHAIN_MINE_LOCK');
