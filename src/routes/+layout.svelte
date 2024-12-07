<script lang="ts">
  import { enhance } from '$app/forms';
  import Navbar from '$lib/components/Navbar.svelte';
  import '../app.css';
  import type { Session } from '@auth/sveltekit';
  import Icon from '@iconify/svelte';
  import type { Prisma } from '@prisma/client';
  import { onMount } from 'svelte';

  interface SessionWithAdapterUser extends Session {
    user: Prisma.UserGetPayload<{
      select: {
        id: true;
        name: true;
        email: true;
        classId: true;
        isAdmin: true;
      };
    }>;
  }

  let { children, data }: { children: any; data: { session: SessionWithAdapterUser } } = $props();

  let classesPromise: Promise<any> = $state(new Promise(() => {}));
  onMount(() => {
    classesPromise = fetch('/api/class').then((res) => res.json());
  });
</script>

<main class="min-h-full bg-gradient-to-tr from-blue-950 to-emerald-950 text-stone-200">
  <Navbar {data} />
  <div class="container ml-auto mr-auto max-w-screen-xl">
    {#if data.session && data.session.user && !data.session.user.classId && !data.session.user.isAdmin}
      <div class="absolute left-0 top-0 h-full w-full bg-black bg-opacity-90 text-white">
        {#await classesPromise}
          <Icon icon="mdi:loading" class="animate-spin text-3xl text-white" />
        {:then classes}
          <div class="flex h-full flex-col gap-3 items-center justify-center">
            <div class="bg-black bg-opacity-70 rounded-xl border p-8 md:p-16 flex flex-col gap-10">
            <h1 class="text-xl md:text-4xl font-bold">Kérlek válassz osztályt!</h1>
            <form method="POST" use:enhance action="?/setClass" class="flex gap-3">
              <select
                name="classId"
                class="border text-sm rounded-lg block w-full p-2.5 bg-black bg-opacity-70 border-stone-300 placeholder-gray-400 text-white transition-all focus:ring-emerald-600 focus:border-emerald-600"
                placeholder="Válassz osztályt"
              >
                {#each classes as _class}
                  <option value={_class.id}>{_class.name}</option>
                {/each}
              </select>
              <button
                type="submit"
                disabled={classesPromise === undefined}
                class="bg-emerald-600 disabled:bg-stone-600 bg-opacity-70 text-white rounded-lg p-2.5 text-center transition-all hover:bg-opacity-80 flex gap-2 items-center"
                >
              <Icon icon="mdi:content-save" class="text-xl" />
                Mentés
              </button>
            </form>
          </div>

          </div>
        {/await}
      </div>
    {/if}
    {@render children()}
  </div>
</main>
