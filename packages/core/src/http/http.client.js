import { Observable } from '../reactivity/observable.js';
import { resolve } from '../di/di.js';

export class HttpClient {
    static registry = [];

    /**
     * Register a global interceptor class.
     * The class will be resolved via DI when HttpClient is instantiated.
     * @param {Class} InterceptorClass 
     */
    static provide(InterceptorClass) {
        this.registry.push(InterceptorClass);
    }

    constructor() {
        this.interceptors = [];

        // Initialize global interceptors
        HttpClient.registry.forEach(InterceptorClass => {
            try {
                const interceptor = resolve(InterceptorClass);
                this.interceptors.push(interceptor);
            } catch (e) {
                console.error('[HttpClient] Failed to resolve interceptor:', InterceptorClass.name, e);
            }
        });
    }

    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }

    request(method, url, options = {}) {
        return new Observable(observer => {
            const controller = new AbortController();
            const signal = controller.signal;

            let req = { method, url, ...options, signal };

            // Apply request interceptors
            // Interceptors can return the modified request or a Promise resolving to it
            const applyInterceptors = async () => {
                try {
                    for (const interceptor of this.interceptors) {
                        if (interceptor.request) {
                            req = await interceptor.request(req);
                        }
                    }

                    const response = await fetch(req.url, req);
                    let res = response;

                    // Apply response interceptors
                    for (const interceptor of this.interceptors) {
                        if (interceptor.response) {
                            res = await interceptor.response(res);
                        }
                    }

                    if (!res.ok) {
                        throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
                    }

                    const data = await res.json();
                    if (observer.next) observer.next(data);
                    if (observer.complete) observer.complete();
                } catch (err) {
                    if (observer.error) observer.error(err);
                }
            };

            applyInterceptors();

            return {
                unsubscribe: () => controller.abort()
            };
        });
    }

    get(url, options) {
        return this.request('GET', url, options);
    }

    post(url, body, options = {}) {
        return this.request('POST', url, { ...options, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options.headers } });
    }

    put(url, body, options = {}) {
        return this.request('PUT', url, { ...options, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options.headers } });
    }

    delete(url, options) {
        return this.request('DELETE', url, options);
    }
}
