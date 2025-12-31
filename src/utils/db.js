export class Database {
    constructor(name, version, stores) {
        this.name = name;
        this.version = version;
        this.stores = stores;
        this.db = null;
    }

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
}
