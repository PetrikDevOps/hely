<script lang="ts">
  import Icon from '@iconify/svelte';
  import { dayjs } from '$lib/utils';
  import LocalizedFormat from 'dayjs/plugin/localizedFormat';
  import huLocale from 'dayjs/locale/hu';

  dayjs.locale(huLocale);
  dayjs.extend(LocalizedFormat);

  let { data, tableHeaders, title, children } = $props();
</script>

<div class="overflow-y-scroll rounded-xl shadow-xl">
  <div
    class="flex w-full justify-between bg-black bg-opacity-30 p-1 px-2 md:justify-normal md:gap-2 md:p-2 md:px-4"
  >
    <h1 class="text-lg font-bold md:text-2xl">{title}</h1>
    <p class="self-center font-light md:self-end md:pb-0.5">{data.length} db</p>
  </div>
  <table class="min-w-full">
    <thead>
      <tr class="border-b border-petrik-3 bg-black bg-opacity-20">
        {#each tableHeaders as header}
          <th
            class="px-2 py-1 text-left font-semibold md:px-4 md:py-2"
            class:hide-mobile={header.hideMobile === true}
          >
            <div class="flex items-center gap-0.5 md:gap-2" class:justify-center={header.center}>
              <Icon icon={header.icon} class="h-4 w-4 md:h-6 md:w-6" />
              <span class="text-sm md:text-lg">{header.name}</span>
            </div>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {@render children()}
    </tbody>
  </table>
</div>

<style lang="postcss">
  th.hide-mobile {
    @apply hidden md:table-cell;
  }
</style>
