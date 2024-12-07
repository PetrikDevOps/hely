<script lang="ts">
  import SubstitutionTable from '$lib/components/table/Substitution.svelte';
  import RoomSubstitutionTable from '$lib/components/table/RoomSub.svelte';

  let { data } = $props();
</script>

<main class="flex md:gap-6 gap-3 flex-col pb-10 px-2 md:px-0">
  {#each data.announcements as announcement}
  <div class="rounded-xl shadow-xl bg-black bg-opacity-30 px-3 md:px-6 py-2 md:py-4">
    <h1 class="md:text-3xl text-xl font-bold">{announcement.title}</h1>
    <p class="md:text-lg text-stone-200">{announcement.content}</p>
  </div>
  {/each}
  {#each Object.values(data.substitutions) as substitutions}
    <SubstitutionTable {substitutions} date={substitutions[0].date} />
  {/each}
  {#each Object.values(data.roomSubstitutions) as roomSubstitutions}
    <RoomSubstitutionTable {roomSubstitutions} date={roomSubstitutions[0].date} />
  {/each}
</main>
