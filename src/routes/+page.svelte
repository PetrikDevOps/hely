<script lang="ts">
  let { data } = $props();
</script>

<main>
  <code>
    {JSON.stringify(data, null, 2)}
  </code>
</main>
