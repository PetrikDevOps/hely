<script lang="ts">
  import { enhance } from '$app/forms';
  import Navbar from '$lib/components/Navbar.svelte';
  import '../app.css';
  import type { Session } from '@auth/sveltekit';
  import Icon from '@iconify/svelte';
  import type { Prisma } from '@prisma/client';
  import { onMount, type Snippet } from 'svelte';

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

  let { children, data }: { children: Snippet; data: { session: SessionWithAdapterUser } } =
    $props();

  let classesPromise: Promise<
    Prisma.ClassGetPayload<{
      select: {
        id: true;
        name: true;
      };
    }>[]
  > = $state(new Promise(() => {}));

  onMount(() => {
    classesPromise = fetch('/api/class').then((res) => res.json());
  });
</script>

<main class="min-h-full bg-gradient-to-br from-petrik-1 to-petrik-2 text-stone-100">
  <Navbar {data} />
  <div class="container ml-auto mr-auto max-w-screen-xl md:px-8">
    {#if data.session && data.session.user && !data.session.user.classId && !data.session.user.isAdmin}
      <div class="absolute left-0 top-0 h-full w-full bg-black bg-opacity-90 text-white">
        {#await classesPromise}
          <Icon icon="mdi:loading" class="animate-spin text-3xl text-white" />
        {:then classes}
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
                    {#each classes as _class}
                      <option value={_class.id}>{_class.name}</option>
                    {/each}
                  </select>
                  <button
                    type="submit"
                    disabled={classesPromise === undefined}
                    class="bg-from-petrik-1 bg-to-petrik-2 flex items-center gap-2 rounded-lg bg-opacity-20 bg-gradient-to-br bg-size-200 bg-pos-0 p-2.5 px-4 py-2 text-center text-white transition-all duration-500 hover:bg-opacity-80 hover:bg-pos-100 disabled:bg-stone-600"
                  >
                    <Icon icon="mdi:content-save" class="text-xl" />
                    Mentés
                  </button>
                </form>
              </div>
            </div>
          </div>
        {/await}
      </div>
    {/if}
    {@render children()}
  </div>
</main>
