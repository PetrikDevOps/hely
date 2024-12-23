<script lang="ts">
  import { enhance } from '$app/forms';
  import Icon from '@iconify/svelte';

  // State management
  let fileInput = $state<HTMLInputElement | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let success = $state<string | null>(null);
</script>

<main>
  <div class="grid grid-cols-3">
    <div class="rounded-xl bg-black bg-opacity-40 p-4 shadow-xl">
      <h1 class="text-xl font-bold">KRÉTA import</h1>

      <form
        use:enhance={() => {
          loading = true;
          error = null;
          success = null;

          return async ({ result, update }) => {
            loading = false;

            if (result.type === 'failure') {
              error = result.data?.message as string;
              success = null;
            } else if (result.type === 'success') {
              success =
                ((result.data?.data as { message: string }).message as string) ||
                'Sikeres importálás!';
              error = null;
              if (fileInput) fileInput.value = '';
            }

            update();
          };
        }}
        class="mt-4"
        action="?/importXlsx"
        method="POST"
        enctype="multipart/form-data"
      >
        <label for="file" class="mb-0.5 block text-sm font-light">
          Kérlek töltsd fel a Krétából exportált xlsx fájlt!
        </label>

        <input
          bind:this={fileInput}
          type="file"
          name="file"
          id="file"
          class="block w-full rounded-lg bg-black bg-opacity-30 p-2"
          accept=".xlsx"
        />

        {#if error}
          <div class="mt-2 text-sm text-red-500">
            <Icon icon="mdi:alert-circle" class="mr-1 inline-block" />
            {error}
          </div>
        {/if}

        {#if success}
          <div class="mt-2 text-sm text-green-500">
            <Icon icon="mdi:check-circle" class="mr-1 inline-block" />
            {success}
          </div>
        {/if}

        <button type="submit" class="button mt-2 w-full justify-center" disabled={loading}>
          {#if loading}
            <Icon icon="mdi:loading" class="animate-spin text-2xl" />
            <span>Dolgozok rajta...</span>
          {:else}
            <Icon icon="mdi:upload" class="text-2xl" />
            <span>Importálás</span>
          {/if}
        </button>
      </form>
    </div>
  </div>
</main>
