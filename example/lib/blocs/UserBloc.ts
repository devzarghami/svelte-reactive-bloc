import {Bloc, BlocState,type EventLogicProps} from "../../../src/lib";
import {map, of, switchMap} from "rxjs";
import {catchError} from "rxjs/operators";


export default class UserBloc extends Bloc {
    state = {
        profile: new BlocState<{ first_name: string; last_name: string }>()
    }

    protected handleEventLogic(event: EventLogicProps) {
        switch (event.eventName) {
            case "handleFetchProfile":
                return this.handleFetchProfile(event);
            default:
                return of();
        }
    }


    private handleFetchProfile(input: EventLogicProps) {
        this.state.profile.setLoading(true);
        return of(input).pipe(
            switchMap((value) => fetch("https://api.example.com", {body: value.data, signal: value.signal})),
            switchMap((response) => response.json()),
            map((value) => {
                this.state.profile.setLoading(false);
                this.state.profile.setData(value)
            }),
            catchError((e) => {
                this.state.profile.setLoading(false);
                this.state.profile.setError(e)
                throw e;
            })
        )
    }

}