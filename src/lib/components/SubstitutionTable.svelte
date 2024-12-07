<script lang="ts">
  import Icon from '@iconify/svelte';
  import dayjs from 'dayjs';
  import LocalizedFormat from 'dayjs/plugin/localizedFormat';
  import huLocale from 'dayjs/locale/hu';

  dayjs.locale(huLocale);
  dayjs.extend(LocalizedFormat)

  let { substitutions, date } = $props();

  const tableHeaders = [
    { name: "", icon: "akar-icons:clock" },
    { name: "Hiányzik", icon: "ic:round-person-off" },
    { name: "Helyettesít", icon: "ic:round-person" },
    { name: "Tantárgy", icon: "akar-icons:book" },
    { name: "Terem", icon: "mdi:place" },
    { name: "Osztály", icon: "fluent:people-team-16-filled" },
    { name: "ÖVH", icon: "material-symbols:merge", center: true },
  ]
</script>

<div class="rounded-xl overflow-hidden border border-petrik-3 shadow-xl">
  <div class="bg-black bg-opacity-30 border-b-2 border-petrik-3 py-2 px-4 flex justify-between items-center">
    <h2 class="text-2xl font-semibold">{dayjs(date).format("LL")} - {dayjs(date).format("dddd")}</h2>
    <div class="flex gap-2">
      <p class="font-light text-lg self-end">{substitutions.length} db</p>
      <h1 class="font-bold text-2xl">Helyettesítések</h1>
    </div>
  </div>
  <table class="min-w-full">
    <thead class="">
      <tr class="border-b border-petrik-3 bg-black bg-opacity-20">
        {#each tableHeaders as header}
          <th class="px-4 py-2 text-left font-semibold">
            <div class="flex items-center gap-2" class:justify-center={header.center}>
              <Icon icon={header.icon} class="w-6 h-6" />
              <span>{header.name}</span>
            </div>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each substitutions as row, index}
        {@const odd = index % 2 == 0}
        <tr class="bg-black" class:bg-opacity-30={odd} class:bg-opacity-20={!odd}>
          <td class="font-bold">{row.lesson}.</td>
          <td>{row.missingTeacher.short}</td>
          <td>{row.teacher.name}</td>
          <td>{row.subject.short}</td>
          <td>{row.room.short}</td>
          <td>{row.class.name}</td>
          <td class="text-center">
            {#if row.consolidated}
              <Icon icon="akar-icons:check" class="text-xl ml-auto mr-auto text-green-500" />
            {/if}
          </td>
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
