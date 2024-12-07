<script lang="ts">
  import SubstitutionTable from '$lib/components/SubstitutionTable.svelte';
  import RoomSubstitutionTable from '$lib/components/RoomSubstitutionTable.svelte';

  let { data } = $props();
</script>

<main class="flex gap-8 flex-col">
  {#each Object.values(data.substitutions) as substitutions}
    <SubstitutionTable {substitutions} date={substitutions[0].date} />
  {/each}
  {#each Object.values(data.roomSubstitutions) as roomSubstitutions}
    <RoomSubstitutionTable {roomSubstitutions} date={roomSubstitutions[0].date} />
  {/each}
</main>
