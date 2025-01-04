<script lang="ts">
    import {BlocDi} from "../../src/lib";
    import UserBloc from "../blocs/UserBloc";
    import {onDestroy, onMount} from "svelte";

    const userBloc = BlocDi.get(UserBloc)

    const profileDispatch$ = userBloc.dispatch("handleFetchProfile", {}, {autoExec: false})
    const profileData$ = userBloc.state.profile.data$
    const profileErrors$ = userBloc.state.profile.errors$
    const profileLoading$ = userBloc.state.profile.loading$


    profileData$.subscribe((value) => {
    })
    profileErrors$.subscribe((value) => {
    })
    profileLoading$.subscribe((value) => {
    })

    profileDispatch$.subscribe({
        next: (data) => {

        },
        error: (err) => {

        }
    })

    onMount(() => profileDispatch$.exec())

    function fetchProfile() {
        userBloc.dispatch("handleFetchProfile", {}).subscribe({
            next: (data) => {

            },
            error: (err) => {

            }
        })
    }

    onDestroy(() => BlocDi.dispose(UserBloc))

</script>

<h1>Simple</h1>
<div class="my-4">
    <div>
        {#if $profileLoading$}
            Loading...
        {/if}
        {#if $profileErrors$}
            An error has occurred:
            {$profileErrors$.message}
        {/if}
        {#if $profileData$}
            <div>
                <h1>{$profileData$.first_name}</h1>
            </div>
        {/if}
    </div>
</div>