/**
 * A wrapper class for IndexedDB operations.
 */
export class Database {
    /**
     * Creates an instance of Database.
     * @param {string} name - The name of the database.
     * @param {number} version - The version of the database.
     * @param {Object} stores - Configuration for object stores.
     */
    constructor(name, version, stores) {
        this.name = name;
        this.version = version;
        this.stores = stores;
        this.db = null;
    }

    /**
     * Connects to the IndexedDB database.
     * @returns {Promise<IDBDatabase>} A promise that resolves to the database instance.
     */
    async connect() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);

            request.onerror = () => reject(request.error);
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
    }

    /**
     * Executes a transaction on a specific store.
     * @param {string} storeName - The name of the object store.
     * @param {IDBTransactionMode} mode - The transaction mode ('readonly' or 'readwrite').
     * @param {function(IDBObjectStore): (IDBRequest|void)} callback - A callback function that receives the store and returns a request or void.
     * @returns {Promise<any>} A promise that resolves with the result of the transaction.
     */
    async transaction(storeName, mode, callback) {
        await this.connect();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = callback(store);

            transaction.oncomplete = () => resolve(request?.result);
            transaction.onerror = () => reject(transaction.error);
            
            // Handle request success if it's a request object
            if (request instanceof IDBRequest) {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            }
        });
    }

    /**
     * Retrieves all items from a store.
     * @param {string} storeName - The name of the store.
     * @returns {Promise<Array>} A promise that resolves with all items in the store.
     */
    async getAll(storeName) {
        return this.transaction(storeName, 'readonly', store => store.getAll());
    }

    /**
     * Retrieves an item by its ID.
     * @param {string} storeName - The name of the store.
     * @param {any} id - The ID of the item to retrieve.
     * @returns {Promise<any>} A promise that resolves with the item.
     */
    async get(storeName, id) {
        return this.transaction(storeName, 'readonly', store => store.get(id));
    }

    /**
     * Adds a new item to the store.
     * @param {string} storeName - The name of the store.
     * @param {any} item - The item to add.
     * @returns {Promise<any>} A promise that resolves with the key of the added item.
     */
    async add(storeName, item) {
        return this.transaction(storeName, 'readwrite', store => store.add(item));
    }

    /**
     * Updates an existing item or adds a new one if it doesn't exist.
     * @param {string} storeName - The name of the store.
     * @param {any} item - The item to put.
     * @returns {Promise<any>} A promise that resolves with the key of the put item.
     */
    async put(storeName, item) {
        return this.transaction(storeName, 'readwrite', store => store.put(item));
    }

    /**
     * Deletes an item by its ID.
     * @param {string} storeName - The name of the store.
     * @param {any} id - The ID of the item to delete.
     * @returns {Promise<void>} A promise that resolves when the item is deleted.
     */
    async delete(storeName, id) {
        return this.transaction(storeName, 'readwrite', store => store.delete(id));
    }
}
