import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { StorageService } from '../../src/services/storage.service.js';

// Mock IndexedDB if necessary, but JSDOM usually has it.
// If JSDOM's indexedDB is missing or broken, we might need 'fake-indexeddb'.

describe('StorageService', () => {
    let storageService;
    const dbName = 'TestDB';
    const storeName = 'items';

    beforeEach(() => {
        storageService = new StorageService();
    });

    afterEach(async () => {
        // Close all connections first
        storageService.closeAll();

        // Clean up database
        const req = indexedDB.deleteDatabase(dbName);
        await new Promise((resolve, reject) => {
            req.onsuccess = resolve;
            req.onerror = reject;
            req.onblocked = () => {
                console.warn('Delete database blocked');
                resolve();
            };
        });
    });

    it('should initialize a database connection', async () => {
        const db = storageService.init(dbName, 1, {
            [storeName]: { keyPath: 'id', autoIncrement: true }
        });
        
        const connection = await db.connect();
        expect(connection.name).toBe(dbName);
        expect(connection.objectStoreNames.contains(storeName)).toBe(true);
    });

    it('should add and retrieve items', async () => {
        const db = storageService.init(dbName, 1, {
            [storeName]: { keyPath: 'id', autoIncrement: true }
        });

        const item = { name: 'Test Item' };
        const id = await db.add(storeName, item);
        
        expect(id).toBeDefined();

        const retrieved = await db.get(storeName, id);
        expect(retrieved).toEqual({ ...item, id });
    });

    it('should get all items', async () => {
        const db = storageService.init(dbName, 1, {
            [storeName]: { keyPath: 'id', autoIncrement: true }
        });

        await db.add(storeName, { name: 'Item 1' });
        await db.add(storeName, { name: 'Item 2' });

        const items = await db.getAll(storeName);
        expect(items).toHaveLength(2);
        expect(items[0].name).toBe('Item 1');
        expect(items[1].name).toBe('Item 2');
    });

    it('should reuse existing connections', () => {
        const db1 = storageService.init(dbName, 1, {});
        const db2 = storageService.init(dbName, 1, {});
        
        expect(db1).toBe(db2);
    });
});
