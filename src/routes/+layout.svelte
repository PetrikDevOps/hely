<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import '../app.css';

  let { children, data } = $props();
</script>

<main class="min-h-full bg-gradient-to-tr from-blue-950 to-emerald-950 text-stone-200">
  <Navbar {data} />
  <div class="container ml-auto mr-auto max-w-screen-xl">
    {@render children()}
  </div>
</main>
