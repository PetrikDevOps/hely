<script lang="ts">
  import Icon from '@iconify/svelte';
  import dayjs from 'dayjs';
  import LocalizedFormat from 'dayjs/plugin/localizedFormat';
  import huLocale from 'dayjs/locale/hu';

  dayjs.locale(huLocale);
  dayjs.extend(LocalizedFormat)

  let { roomSubstitutions, date } = $props();

  const tableHeaders = [
    { name: '', icon: 'akar-icons:clock' },
    { name: 'Honnan', icon: 'lucide:arrow-up-from-line' },
    { name: 'Hova', icon: 'lucide:arrow-down-from-line' },
    { name: 'Osztály', icon: 'fluent:people-team-16-filled' }
  ];
</script>

<div class="overflow-hidden rounded-xl shadow-xl">
  <div
    class="flex items-center justify-between border-b-2 border-petrik-3 bg-black bg-opacity-30 px-4 py-2"
  >
    <h2 class="text-2xl font-semibold">{dayjs(date).format("LL")} - {dayjs(date).format("dddd")}</h2>
    <div class="flex gap-2">
      <p class="font-light text-lg self-end">{roomSubstitutions.length} db</p>
      <h1 class="font-bold text-2xl">Teremcserék</h1>
    </div>
  </div>
  <table class="min-w-full">
    <thead class="">
      <tr class="border-b border-petrik-3 bg-black bg-opacity-20">
        {#each tableHeaders as header}
          <th class="px-4 py-2 text-left font-semibold">
            <div class="flex items-center gap-2">
              <Icon icon={header.icon} class="h-6 w-6" />
              <span>{header.name}</span>
            </div>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each roomSubstitutions as row, index}
        {@const odd = index % 2 == 0}
        <tr class="bg-black" class:bg-opacity-30={odd} class:bg-opacity-20={!odd}>
          <td class="font-bold">{row.lesson}.</td>
          <td>{row.fromRoom.short}</td>
          <td>{row.toRoom.short}</td>
          <td>{row.class.name}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="postcss">
  tr:last-child td {
    border-bottom-width: 0;
  }

  tr td {
    @apply px-4 py-2 border-b border-petrik-3;
  }
</style>
