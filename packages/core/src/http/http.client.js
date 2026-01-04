// ============================================================================
// Internal Dependencies
// ============================================================================
import { resolve } from '../di/di.js';
import { Observable } from '../reactivity/observable.js';

/**
 * @typedef {Object} HttpRequestOptions
 * @property {Object.<string, string>} [headers] - HTTP headers
 * @property {any} [body] - Request body
 * @property {string} [mode] - Request mode (cors, no-cors, same-origin)
 * @property {string} [cache] - Cache mode
 * @property {string} [credentials] - Credentials mode
 */

/**
 * @typedef {Object} HttpInterceptor
 * @property {function(Request): (Request|Promise<Request>)} [request] - Intercept request
 * @property {function(Response): (Response|Promise<Response>)} [response] - Intercept response
 */

export class HttpClient {
    static registry = [];

    /**
     * Register a global interceptor class.
     * The class will be resolved via DI when HttpClient is instantiated.
     * @param {new () => HttpInterceptor} InterceptorClass 
     */
    static provide(InterceptorClass) {
        this.registry.push(InterceptorClass);
    }

    constructor() {
        /** @type {HttpInterceptor[]} */
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

    /**
     * Add an interceptor instance
     * @param {HttpInterceptor} interceptor 
     */
    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * Make an HTTP request
     * @param {string} method - HTTP method (GET, POST, etc.)
     * @param {string} url - Request URL
     * @param {HttpRequestOptions} [options] - Request options
     * @returns {Observable<any>} Observable of the response data
     */
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

    /**
     * Make a GET request
     * @param {string} url 
     * @param {HttpRequestOptions} [options] 
     * @returns {Observable<any>}
     */
    get(url, options) {
        return this.request('GET', url, options);
    }

    /**
     * Make a POST request
     * @param {string} url 
     * @param {any} body 
     * @param {HttpRequestOptions} [options] 
     * @returns {Observable<any>}
     */
    post(url, body, options = {}) {
        return this.request('POST', url, { ...options, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options.headers } });
    }

    /**
     * Make a PUT request
     * @param {string} url 
     * @param {any} body 
     * @param {HttpRequestOptions} [options] 
     * @returns {Observable<any>}
     */
    put(url, body, options = {}) {
        return this.request('PUT', url, { ...options, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json', ...options.headers } });
    }

    /**
     * Make a DELETE request
     * @param {string} url 
     * @param {HttpRequestOptions} [options] 
     * @returns {Observable<any>}
     */
    delete(url, options) {
        return this.request('DELETE', url, options);
    }
}
