<script lang="ts">
  import SubstitutionTable from '$lib/components/table/Substitution.svelte';
  import RoomSubstitutionTable from '$lib/components/table/RoomSub.svelte';
  import { dayjs } from '$lib/utils';
  import Icon from '@iconify/svelte';

  let { data } = $props();
</script>

<main class="flex flex-col gap-3 px-2 pb-10 md:gap-6 md:px-0">
  {#each Object.entries(data.groupedByDate) as entry}
    {@const [date, data] = entry}
    <div class="flex flex-col gap-3">
      <h1 class="text-center text-xl font-bold md:text-3xl">{dayjs(date).format('L - dddd')}</h1>
      {#each data.announcements as announcement}
        <div class="flex items-center gap-1 rounded-xl bg-black bg-opacity-30 p-2 shadow-lg">
          <Icon
            icon="mdi:information"
            class="shrink-0 self-start text-2xl text-blue-500 md:text-3xl"
          />
          <span class="text-sm md:text-lg">{announcement.content}</span>
        </div>
      {/each}
    </div>

    {#if data.substitutions.length > 0}
      <SubstitutionTable substitutions={data.substitutions} />
    {/if}
    {#if data.roomSubstitutions.length > 0}
      <RoomSubstitutionTable roomSubstitutions={data.roomSubstitutions} />
    {/if}
  {/each}
  <!-- if all empty -->
  {#if Object.values(data.groupedByDate).every((d) => d.announcements.length === 0 && d.substitutions.length === 0 && d.roomSubstitutions.length === 0)}
    <div class="flex items-center justify-center gap-3">
      <Icon icon="mdi:emoticon-sad-outline" class="text-6xl" />
      <span class="text-2xl font-bold">Jaj ne, minden órára be kell menni!</span>
    </div>
  {/if}
</main>
