import { Service } from './service.js';

/**
 * Core Storage Service for managing IndexedDB databases.
 * Allows creating and managing multiple database connections.
 */
export class StorageService extends Service {
    constructor() {
        super({});
        this._dbs = new Map();
    }

    /**
     * Initialize or retrieve a database connection.
     * @param {string} name - Database name
     * @param {number} version - Database version
     * @param {object} stores - Store configuration
     * @returns {Database} The database instance
     */
    init(name, version, stores) {
        if (!this._dbs.has(name)) {
            this._dbs.set(name, new Database(name, version, stores));
        }
        return this._dbs.get(name);
    }

    closeAll() {
        this._dbs.forEach(db => db.close());
        this._dbs.clear();
    }
}

/**
 * Wrapper for IndexedDB operations.
 */
class Database {
    constructor(name, version, stores) {
        this.name = name;
        this.version = version;
        this.stores = stores;
        this.db = null;
        this._connectPromise = null;
    }

    async connect() {
        if (this.db) return this.db;
        if (this._connectPromise) return this._connectPromise;

        this._connectPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);

            request.onerror = () => {
                this._connectPromise = null;
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                Object.entries(this.stores).forEach(([storeName, config]) => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, {
                            keyPath: config.keyPath || 'id',
                            autoIncrement: config.autoIncrement || false
                        });
                        
                        if (config.indexes) {
                            config.indexes.forEach(idx => {
                                store.createIndex(idx.name, idx.keyPath, idx.options);
                            });
                        }
                    }
                });
            };
        });

        return this._connectPromise;
    }

    async transaction(storeName, mode, callback) {
        await this.connect();
        return new Promise((resolve, reject) => {
            let transaction;
            try {
                transaction = this.db.transaction(storeName, mode);
            } catch (e) {
                reject(e);
                return;
            }

            const store = transaction.objectStore(storeName);
            let request;

            try {
                request = callback(store);
            } catch (e) {
                reject(e);
                return;
            }

            transaction.oncomplete = () => {
                // For get/getAll/add/put/delete, the result is in request.result
                // But we need to be careful about what 'callback' returns.
                // If callback returns the request object, we can use request.result.
                resolve(request?.result);
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };
        });
    }

    async getAll(storeName) {
        return this.transaction(storeName, 'readonly', store => store.getAll());
    }

    async get(storeName, id) {
        return this.transaction(storeName, 'readonly', store => store.get(id));
    }

    async add(storeName, item) {
        return this.transaction(storeName, 'readwrite', store => store.add(item));
    }

    async put(storeName, item) {
        return this.transaction(storeName, 'readwrite', store => store.put(item));
    }

    async delete(storeName, id) {
        return this.transaction(storeName, 'readwrite', store => store.delete(id));
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this._connectPromise = null;
        }
    }
}
