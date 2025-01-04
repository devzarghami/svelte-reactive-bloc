// Importing the necessary classes for your Bloc system

// Bloc class: This is the main class that developers will use to define their business logic and handle state management.
import Bloc from "./bloc.js";

// BlocDi class: This class helps with Dependency Injection (DI) by managing the injection of services and dependencies into your Bloc instances.
import BlocDi from "./blocDi.js";

// BlocState class: This class is used to manage and update the state for a specific feature or part of your application.
import BlocState from "./blocState.js";

// Exporting the core classes for external use in the application or other projects.
export {
    /**
     * Bloc - The core class for managing business logic and application state.
     * This class allows you to create a Bloc by extending it and implementing your business logic.
     * It manages event dispatching, state changes, and error handling.
     *
     * Example:
     *
     * class MyBloc extends Bloc {
     *   public state = {
     *     counter: new BlocState<number>(0), // A state to manage counter
     *   };
     *
     *   public increment() {
     *     this.dispatch("increment"); // Dispatch event to handle logic
     *   }
     *
     *   protected handleEventLogic(event: any) {
     *     switch (event.eventName) {
     *       case "increment":
     *         this.state.counter.setData(this.state.counter.data + 1); // Update state
     *         break;
     *       default:
     *         return of();
     *     }
     *   }
     * }
     */
        Bloc,

    /**
     * BlocDi - Dependency Injection utility for managing dependencies within your Bloc system.
     * This class is optional and helps you manage dependencies that need to be injected into your Bloc classes.
     * You can store your dependencies in a container and resolve them as needed when creating Bloc instances.
     *
     * Example:
     *
     * class UserService {
     *   getUser() {
     *     return { id: 1, name: "John Doe" };
     *   }
     * }
     *
     * const blocDi = new BlocDi();
     * blocDi.register(UserService); // Register service in the DI container
     *
     * class UserBloc extends Bloc {
     *   private userService: UserService;
     *
     *   constructor() {
     *     this.userService = blocDi.get(UserService); // Inject service
     *   }
     *
     *   public fetchUser() {
     *     const user = this.userService.getUser();
     *     console.log(user); // Fetch and use the injected service
     *   }
     * }
     */
        BlocDi,

    /**
     * BlocState - A class to handle the state of your application within a Bloc.
     * Each state is tied to a specific part of your app, such as loading state, data, and errors.
     * The BlocState class simplifies the management of these states with methods like:
     * - `setLoading`: To indicate a loading state.
     * - `setData`: To set the data of the state.
     * - `setError`: To handle error states.
     *
     * Example:
     *
     * class UserBloc extends Bloc {
     *   public state = {
     *     user: new BlocState<User | null>(null), // Initial state: user is null
     *   };
     *
     *   public fetchUser() {
     *     this.state.user.setLoading(true); // Set loading before making the request
     *     RestApi.get("/user").subscribe(
     *       (data) => {
     *         this.state.user.setData(data); // Set user data after successful fetch
     *       },
     *       (error) => {
     *         this.state.user.setError(error); // Handle error if request fails
     *       }
     *     );
     *   }
     * }
     */
        BlocState,
};
