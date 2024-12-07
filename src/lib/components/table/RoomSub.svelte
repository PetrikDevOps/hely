<script lang="ts">
  import Base from './Base.svelte';

  let { roomSubstitutions, date } = $props();

  const tableHeaders = [
    { name: '', icon: 'akar-icons:clock' },
    { name: 'Honnan', icon: 'lucide:arrow-up-from-line' },
    { name: 'Hova', icon: 'lucide:arrow-down-from-line' },
    { name: 'Osztály', icon: 'fluent:people-team-16-filled' }
  ];
</script>

<Base data={roomSubstitutions} {date} {tableHeaders} title="Teremcserék">
  {#each roomSubstitutions as row, index}
    {@const odd = index % 2 == 0}
    <tr class="bg-black" class:bg-opacity-30={odd} class:bg-opacity-20={!odd}>
      <td class="ml-1! font-bold">{row.lesson}.</td>
      <td>{row.fromRoom.short}</td>
      <td>{row.toRoom.short}</td>
      <td>{row.class.name}</td>
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
