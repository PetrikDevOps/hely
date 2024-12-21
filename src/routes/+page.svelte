<script lang="ts">
  import SubstitutionTable from '$lib/components/table/Substitution.svelte';
  import RoomSubstitutionTable from '$lib/components/table/RoomSub.svelte';
  import dayjs from 'dayjs';
  import huLocale from 'dayjs/locale/hu';
  dayjs.locale(huLocale);
  import { capitalize } from '$lib/utils';

  let { data } = $props();
</script>

<main class="flex flex-col gap-3 px-2 pb-10 md:gap-6 md:px-0">
  {#each data.announcements as announcement}
    <div class="rounded-xl bg-black bg-opacity-30 px-3 py-2 shadow-xl md:px-6 md:py-4">
      <div class="flex justify-between">
        <h1 class="text-xl font-bold md:text-3xl">{announcement.title}</h1>
        <p class="text-stone-200 md:text-xl md:font-semibold self-end">{capitalize(dayjs(announcement.date).format("dddd"))}</p>
      </div>
      <p class="text-stone-200 md:text-lg">{announcement.content}</p>
    </div>
  {/each}
  {#each Object.entries(data.substitutions) as [date, substitutions]}
    <SubstitutionTable {substitutions} {date} />
  {/each}
  {#each Object.entries(data.roomSubstitutions) as [date, roomSubstitutions]}
    <RoomSubstitutionTable {roomSubstitutions} {date} />
  {/each}
</main>
