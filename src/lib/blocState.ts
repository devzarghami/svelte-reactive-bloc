import {writable, get} from "svelte/store";
import {Observable} from "rxjs";

// Interface for error structure
export interface ErrorInterface {
    code: string | number;
    stack?: string;
    message: string;
    errors: Record<string, any>;
}

// Interface for data structure
interface DataInterface {
    [key: string]: any;
}

/**
 * A class that manages state for data, loading, and errors,
 * combining Svelte's stores and RxJS Observables.
 *
 * @template D - The type of data being managed.
 * @template E - The type of error being managed.
 */
export default class BlocState<D = DataInterface, E = ErrorInterface> {
    private dataStore = writable<D | null>(null); // Svelte store for data
    private errorStore = writable<E | null>(null); // Svelte store for errors
    private loadingStore = writable<boolean>(false); // Svelte store for loading state

    /**
     * Initializes the BlocState with optional data.
     * If `initValue` is a function returning a promise, it initializes asynchronously.
     *
     * @param initValue - Initial data or an async initializer function.
     */
    constructor(initValue?: D | (() => Promise<D>)) {
        if (typeof initValue === "function") {
            (initValue as () => Promise<D>)()
                .then((value: D) => this.setData(value))
                .catch((error: E) => this.setError(error));
        } else if (initValue !== undefined) {
            this.setData(initValue);
        }
    }

    /**
     * Synchronously retrieves the current data value.
     */
    get data(): D | null {
        return get(this.dataStore);
    }

    /**
     * An Observable stream for the data.
     */
    get data$(): Observable<D | null> {
        return this.createObservable(this.dataStore);
    }

    /**
     * Synchronously retrieves the loading state.
     */
    get loading(): boolean {
        return get(this.loadingStore);
    }

    /**
     * An Observable stream for the loading state.
     */
    get loading$(): Observable<boolean> {
        return this.createObservable(this.loadingStore);
    }

    /**
     * An Observable stream for errors.
     */
    get errors(): E | null {
        return get(this.errorStore);
    }

    /**
     * An Observable stream for errors.
     */
    get errors$(): Observable<E | null> {
        return this.createObservable(this.errorStore);
    }

    /**
     * Updates the loading state.
     *
     * @param loading - The new loading state.
     */
    public setLoading(loading: boolean): void {
        this.loadingStore.set(loading);
    }

    /**
     * Updates the data and clears any existing errors.
     *
     * @param data - The new data to set.
     */
    public setData(data: D): void {
        this.dataStore.set(data);
        this.errorStore.set(null); // Clear errors when data is updated
    }

    /**
     * Partially updates the current data state.
     *
     * @param partialData - Partial data to merge with the existing state.
     */
    public updateData(partialData: Partial<D>): void {
        const currentData = get(this.dataStore);
        this.dataStore.set(<D>{...currentData, ...partialData});
    }

    /**
     * Updates the error state.
     * Supports plain errors, `Error` objects, and structured errors.
     *
     * @param error - The error to set (or null to clear).
     */
    public setError(error: E | Error | null): void {
        if (!error) {
            this.errorStore.set(null);
        } else if (error instanceof Error) {
            this.errorStore.set({
                code: "APP_EXCEPTION",
                stack: error.stack,
                message: error.message,
                errors: {[error.name]: error.message},
            } as E);
        } else if (error) {
            this.errorStore.set(error);
        }
    }

    /**
     * Partially updates the current error state.
     *
     * @param partialError - Partial error to merge with the existing error state.
     */
    public updateError(partialError: Partial<E>): void {
        const currentError = get(this.errorStore);
        if (currentError) {
            this.errorStore.set({...currentError, ...partialError});
        } else {
            this.errorStore.set(partialError as E);
        }
    }

    /**
     * Resets all states (data, errors, and loading) to their initial values.
     */
    public dispose(): void {
        this.dataStore.set(null);
        this.errorStore.set(null);
        this.loadingStore.set(false);
    }

    /**
     * Converts a Svelte store to an RxJS Observable.
     *
     * @param store - The Svelte store to convert.
     */
    private createObservable<T>(store: { subscribe: (fn: (value: T) => void) => () => void }): Observable<T> {
        return new Observable<T>((subscriber) => {
            const unsubscribe = store.subscribe((value) => subscriber.next(value));
            return () => unsubscribe();
        });
    }
}
