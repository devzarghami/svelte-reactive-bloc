export type Constructable<T> = new (...args: any[]) => T;

/**
 * Dependency Injection (DI) container for managing Bloc class instances.
 */
class BlocDi {
    private containerMap: Map<Constructable<any>, any> = new Map();

    /**
     * Retrieves an existing instance of the provided class or creates a new one.
     * @param input - The class constructor to instantiate or retrieve.
     * @returns The instance of the provided class.
     */
    get<T>(input: Constructable<T>): T {
        if (this.containerMap.has(input)) {
            return this.containerMap.get(input) as T;
        }

        const instance = new input();
        this.containerMap.set(input, instance);
        return instance;
    }

    /**
     * Disposes of an existing instance of the provided class.
     * Calls the `dispose` method on the instance if it exists.
     * @param input - The class constructor to dispose.
     */
    dispose<T>(input: Constructable<T>): void {
        const instance = this.containerMap.get(input);
        if (instance?.dispose) {
            instance.dispose();
        }
        this.containerMap.delete(input);
    }

    /**
     * Clears all stored instances and disposes of them if applicable.
     */
    clear(): void {
        for (const instance of this.containerMap.values()) {
            if (instance?.dispose) {
                instance.dispose();
            }
        }
        this.containerMap.clear();
    }
}

export default new BlocDi();
