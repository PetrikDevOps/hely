<script lang="ts">
  import SubstitutionTable from '$lib/components/table/Substitution.svelte';
  import RoomSubstitutionTable from '$lib/components/table/RoomSub.svelte';

  let { data } = $props();
</script>

<main class="flex flex-col gap-3 px-2 pb-10 md:gap-6 md:px-0">
  {#each data.announcements as announcement}
    <div class="rounded-xl bg-black bg-opacity-30 px-3 py-2 shadow-xl md:px-6 md:py-4">
      <h1 class="text-xl font-bold md:text-3xl">{announcement.title}</h1>
      <p class="text-stone-200 md:text-lg">{announcement.content}</p>
    </div>
  {/each}
  {#each Object.values(data.substitutions) as substitutions}
    <SubstitutionTable {substitutions} date={substitutions[0].date} />
  {/each}
  {#each Object.values(data.roomSubstitutions) as roomSubstitutions}
    <RoomSubstitutionTable {roomSubstitutions} date={roomSubstitutions[0].date} />
  {/each}
</main>
