<script lang="ts">
  import Icon from '@iconify/svelte';
  import Base from './Base.svelte';

  let { substitutions } = $props();

  const tableHeaders = [
    { name: '', icon: 'akar-icons:clock' },
    { name: 'Hiányzik', icon: 'ic:round-person-off' },
    { name: 'Helyettesít', icon: 'ic:round-person' },
    { name: 'Tantárgy', icon: 'akar-icons:book', hideMobile: true },
    { name: 'Terem', icon: 'mdi:place', hideMobile: true },
    { name: '', icon: 'material-symbols:merge', center: true }
  ];
</script>

<Base data={substitutions} {tableHeaders} title="Helyettesítések">
  {#each substitutions as row, index}
    {@const odd = index % 2 == 0}
    <tr class="bg-black" class:bg-opacity-30={odd} class:bg-opacity-20={!odd}>
      <td class="font-bold">{row.lesson}.</td>
      <td>{row.missingTeacher.short}</td>
      <td class="hidden md:table-cell">{row.teacher.name}</td>
      <td class="md:hidden">{row.teacher.short}</td>
      <td class="hidden md:table-cell">{row.subject.short}</td>
      <td class="hidden md:table-cell">{row.room.short}</td>

      <td class="">
        {#if row.consolidated}
        <div class="flex justify-center items-center">
          <Icon icon="akar-icons:check" class="text-green-500 self-center" />
          </div>
        {/if}
      </td>
    </tr>
  {/each}
</Base>

<style lang="postcss">
  tr:last-child td {
    border-bottom-width: 0;
  }

  tr td {
    @apply border-b border-petrik-3 px-2 py-1 text-sm md:px-4 md:py-2 md:text-base;
  }
</style>
