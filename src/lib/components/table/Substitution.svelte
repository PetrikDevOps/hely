<script lang="ts">
  import Icon from "@iconify/svelte";
  import Base from "./Base.svelte";

  let { substitutions, date } = $props();

  const tableHeaders = [
    { name: "", icon: "akar-icons:clock" },
    { name: "Hiányzik", icon: "ic:round-person-off" },
    { name: "Helyettesít", icon: "ic:round-person" },
    { name: "Tantárgy", icon: "akar-icons:book", hideMobile: true },
    { name: "Terem", icon: "mdi:place", hideMobile: true },
    { name: "Osztály", icon: "fluent:people-team-16-filled" },
    { name: "ÖVH", icon: "material-symbols:merge", center: true, hideMobile: true },
  ]
</script>

<Base data={substitutions} {date} {tableHeaders} title="Helyettesítések">
  {#each substitutions as row, index}
    {@const odd = index % 2 == 0}
    <tr class="bg-black" class:bg-opacity-30={odd} class:bg-opacity-20={!odd}>
      <td class="font-bold">{row.lesson}.</td>
      <td>{row.missingTeacher.short}</td>
      <td class="hidden md:table-cell">{row.teacher.name}</td>
      <td class="md:hidden">{row.teacher.short}</td>
      <td class="hidden md:table-cell">{row.subject.short}</td>
      <td class="hidden md:table-cell">{row.room.short}</td>
      <td>{row.class.name}</td>
      <td class="text-center hidden md:table-cell">
        {#if row.consolidated}
          <Icon icon="akar-icons:check" class="text-green-500" />
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
    @apply text-sm md:text-base px-2 md:px-4 py-1 md:py-2 border-b border-petrik-3;
  }
</style>
