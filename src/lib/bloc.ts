import {finalize, map, Observable, of, Subject, Subscription} from "rxjs";
import {catchError} from "rxjs/operators";
import {type ErrorInterface} from "$lib/blocState.js";

export class DispatchOptions {
    keepAlive: boolean = false;
    multiple: boolean = false;
    timeout: number = 120; // Timeout in milliseconds, default is 5000ms
    autoExec: boolean = true; // Added autoExec option to control immediate execution
    [key: string]: any;
}

export interface DispatchOptionsProps extends DispatchOptions {
}

export interface EventLogicProps<D = Record<string, any>> {
    eventName: string,
    signal: AbortSignal,
    data: D
}

export default class Bloc {
    private logicSubscriptions: Record<string, Subscription> = {};
    private inlineSubscriptions: Record<string, Subscription> = {};
    private abortControllers: Record<string, AbortController> = {}; // Store abort controllers for each event

    // Dispatch method with autoExec support
    public dispatch<T>(
        eventName: string,
        data: Record<string, any> = {},
        options: Partial<DispatchOptionsProps> = new DispatchOptions()
    ): {
        subscribe: (input: { next?: (value: T) => void; error?: (err: ErrorInterface | null) => void }) => void;
        abort: () => void; // Expose abort method
        exec: () => void; // Expose exec method to manually execute the event
    } {
        const uniqueKey = options.multiple
            ? `${eventName}-${Date.now()}`
            : eventName; // Unique key if `multiple` is true, otherwise use eventName.

        // If not multiple and already an active subscription for the event, return early.
        if (!options.multiple && this.logicSubscriptions[uniqueKey]?.closed === false) {
            return {
                subscribe: () => {
                },
                abort: () => {
                },
                exec: () => {
                },
            };
        }

        const subject = new Subject<T>();
        const abortController = new AbortController(); // Create a new AbortController for this event
        this.abortControllers[uniqueKey] = abortController; // Store it for later use

        const timeoutId = setTimeout(() => {
            if (abortController.signal.aborted) return;
            subject.error({error: "Event timed out", errors: {}});
            this.cleanupSubscription(uniqueKey);
        }, options.timeout);

        const dispatcher = this.handleEventLogic({
            eventName, data,
            signal: abortController.signal, // Pass the signal to the event logic
        })
            .pipe(
                map((value) => {
                    subject.next(value);
                    return value;
                }),
                catchError((error) => {
                    this.processError(error, subject);
                    return of(error);
                }),
                finalize(() => {
                    clearTimeout(timeoutId); // Clear timeout when event completes
                    if (!options.keepAlive) {
                        this.cleanupSubscription(uniqueKey);
                    }
                })
            );

        // If autoExec is true (default behavior), execute immediately
        if (options.autoExec) {
            this.logicSubscriptions[uniqueKey] = dispatcher.subscribe();
        }

        return {
            subscribe: (input) => {
                this.inlineSubscriptions[uniqueKey] = subject.subscribe({
                    next: (value) => this.handleNext(input, value, subject, uniqueKey),
                    error: (err) => this.handleError(input, err, subject, uniqueKey),
                });
            },
            abort: () => {
                abortController.abort(); // Abort the event when called
                subject.error({error: "Event was aborted", errors: {}});
                this.cleanupSubscription(uniqueKey);
            },
            exec: () => {
                // Manually execute the dispatcher if autoExec is false
                if (options.autoExec === false) {
                    this.logicSubscriptions[uniqueKey] = dispatcher.subscribe();
                }
            },
        };
    }

    public dispose(): void {
        this.cleanupAllSubscriptions(this.logicSubscriptions);
        this.cleanupAllSubscriptions(this.inlineSubscriptions);
        Object.keys(this.abortControllers).forEach((key) => {
            this.abortControllers[key].abort(); // Abort any active event
        });
    }

    protected handleEventLogic(event: EventLogicProps): Observable<any> {
        return new Observable((observer) => {
            const signal = event.signal;
            // Simulate a network request or logic here
            setTimeout(() => {
                if (signal.aborted) return;
                observer.next("Fetched data successfully");
                observer.complete();
            }, 3000); // Simulating a 3-second delay for the operation
        });
    }

    private processError(error: any, subject: Subject<any>): void {
        if (!error) {
            subject.error(null);
        } else if (error instanceof Error) {
            subject.error({error: error.message, errors: {}});
        } else if (
            !error?.error &&
            error?.errors &&
            typeof error.errors === "object" &&
            Object.values(error.errors).length
        ) {
            subject.error({
                error: Object.values(error.errors)[0],
                errors: error.errors,
            });
        } else if (error.error && error.errors) {
            subject.error(error);
        }
    }

    private handleNext<T>(
        input: { next?: (value: T) => void },
        value: T,
        subject: Subject<T>,
        uniqueKey: string
    ): void {
        if (input?.next) {
            try {
                input.next(value);
            } catch (e) {
                console.error(e);
                subject.error(e);
            } finally {
                this.completeAndCleanup(subject, uniqueKey);
            }
        }
    }

    private handleError(
        input: { error?: (err: ErrorInterface | null) => void },
        err: ErrorInterface | null,
        subject: Subject<any>,
        uniqueKey: string
    ): void {
        if (input?.error) {
            try {
                input.error(err);
            } catch (e) {
                console.error(e);
            } finally {
                this.completeAndCleanup(subject, uniqueKey);
            }
        }
    }

    private completeAndCleanup(subject: Subject<any>, uniqueKey: string): void {
        subject.complete();
        subject.unsubscribe();
        this.cleanupInlineSubscription(uniqueKey);
    }

    private cleanupSubscription(uniqueKey: string): void {
        if (this.logicSubscriptions[uniqueKey]) {
            this.logicSubscriptions[uniqueKey].unsubscribe();
            delete this.logicSubscriptions[uniqueKey];
        }
        if (this.abortControllers[uniqueKey]) {
            this.abortControllers[uniqueKey].abort();
            delete this.abortControllers[uniqueKey];
        }
    }

    private cleanupInlineSubscription(uniqueKey: string): void {
        if (this.inlineSubscriptions[uniqueKey]) {
            this.inlineSubscriptions[uniqueKey].unsubscribe();
            delete this.inlineSubscriptions[uniqueKey];
        }
    }

    private cleanupAllSubscriptions(subscriptions: Record<string, Subscription>): void {
        Object.keys(subscriptions).forEach((key) => {
            subscriptions[key]?.unsubscribe();
            delete subscriptions[key];
        });
    }
}
