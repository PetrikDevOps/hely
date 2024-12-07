<script lang="ts">
  import Icon from '@iconify/svelte';
  import dayjs from 'dayjs';
  import LocalizedFormat from 'dayjs/plugin/localizedFormat';
  import huLocale from 'dayjs/locale/hu';

  dayjs.locale(huLocale);
  dayjs.extend(LocalizedFormat);

  let { data, date, tableHeaders, title, children } = $props();
</script>

<div class="overflow-hidden rounded-xl shadow-xl">
  <div
    class="flex items-center justify-between border-b-2 border-petrik-3 bg-black bg-opacity-30 px-2 py-2 md:px-4"
  >
    <div class="flex gap-0.5 md:gap-2">
      <h1 class="font-bold md:text-2xl">{title}</h1>
      <p class="hidden self-end font-light md:block md:text-lg">{data.length} db</p>
    </div>
    <h2 class="hidden text-2xl font-semibold md:block">
      {dayjs(date).format('LL')} - {dayjs(date).format('dddd')}
    </h2>
    <h2 class="block md:hidden">{dayjs(date).format('L')} - {dayjs(date).format('dddd')}</h2>
  </div>
  <table class="min-w-full">
    <thead>
      <tr class="border-b border-petrik-3 bg-black bg-opacity-20">
        {#each tableHeaders as header}
          <th
            class="px-2 py-1 text-left font-semibold md:px-4 md:py-2"
            class:hide-mobile={header.hideMobile === true}
          >
            <div class="flex items-center gap-0.5 md:gap-2">
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
