<script lang="ts">
  import { enhance } from '$app/forms';
  import Navbar from '$lib/components/Navbar.svelte';
  import '../app.css';
  import Icon from '@iconify/svelte';
  import { type Snippet } from 'svelte';
  import type { LayoutServerData } from './$types';

  let { children, data }: { children: Snippet; data: LayoutServerData } =
    $props();
</script>

<main class="min-h-full bg-gradient-to-br from-petrik-1 to-petrik-2 text-stone-100">
  <Navbar {data} />
  <div class="container px-3 pt-4 ml-auto mr-auto max-w-screen-xl md:px-8">
    {#if data.session && data.session.user && !data.session.user.classId && !data.session.user.isAdmin && data.classes}
      <div class="absolute left-0 top-0 h-full w-full bg-black bg-opacity-90 text-white">
          <div class="flex h-full flex-col items-center justify-center gap-3">
            <div class="rounded-xl bg-gradient-to-b from-petrik-1 to-petrik-2 p-px">
              <div class="flex flex-col gap-3 rounded-[calc(0.75rem-1px)] bg-black p-10">
                <h1 class="text-xl font-bold md:text-4xl">Kérlek válassz osztályt!</h1>
                <form method="POST" use:enhance action="?/setClass" class="flex gap-3">
                  <select
                    name="classId"
                    class="block w-full rounded-lg border bg-black bg-opacity-70 p-2.5 text-sm text-white placeholder-gray-400 transition-all focus:border-petrik-2 focus:ring-petrik-2"
                    placeholder="Válassz osztályt"
                  >
                    {#each data.classes as _class}
                      <option value={_class.id}>{_class.name}</option>
                    {/each}
                  </select>
                  <button
                    type="submit"
                    class="bg-from-petrik-1 bg-to-petrik-2 flex items-center gap-2 rounded-lg bg-opacity-20 bg-gradient-to-br bg-size-200 bg-pos-0 p-2.5 px-4 py-2 text-center text-white transition-all duration-500 hover:bg-opacity-80 hover:bg-pos-100 disabled:bg-stone-600"
                  >
                    <Icon icon="mdi:content-save" class="text-xl" />
                    Mentés
                  </button>
                </form>
              </div>
            </div>
          </div>
      </div>
    {/if}
    {@render children()}
  </div>
</main>
