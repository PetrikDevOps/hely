<script lang="ts">
  import KretaImportPicker from '$lib/components/admin/KretaImportPicker.svelte';
  import { enhance } from '$app/forms';
  import { getDay } from '$lib/utils';
  import Icon from '@iconify/svelte';

  let { data } = $props();

  let subDate = $state(new Date().toISOString().split('T')[0]);
  let subClassId = $state('');
  let subLessonId = $state('');
  let subTeacherId = $state('');
  let subConsolidated = $state(false);
  let subCancelled = $state(false);
  let subRoomId = $state('');

  let error = $state<string | null>(null);
  let success = $state<string | null>(null);

  let lessons = $state(data.lessons);

  $effect(() => {
    if (subClassId) {
      console.log(getDay(subDate));
      lessons = data.lessons.filter((l) => l.classId === subClassId && l.day == getDay(subDate));
    }
  });

  $effect(() => {
    if (subLessonId) {
      const lesson = data.lessons.find((l) => l.id === subLessonId);
      if (!lesson) return;
      subRoomId = lesson.roomId;
    }
  });
</script>

<main class="flex flex-col gap-4">
  <div class="grid grid-cols-3 gap-4">
    <div class="rounded-xl bg-black bg-opacity-40 p-4 shadow-xl">
      <h1 class="text-xl font-bold">KRÉTA import</h1>
      <KretaImportPicker />
    </div>
    <div class="rounded-xl bg-black bg-opacity-40 p-4 shadow-xl"></div>
    <div class="rounded-xl bg-black bg-opacity-40 p-4 shadow-xl"></div>
  </div>

  <div class="rounded-xl bg-black bg-opacity-40 p-4 shadow-xl">
    <h1 class="text-xl font-bold">Új helyettesítés</h1>

    <form
      use:enhance={({ formData }) => {
        error = null;
        success = null;

        const lesson = data.lessons.filter((l) => l.id === subLessonId)[0];

        const subDateVal = subDate + 'T00:00:00.000Z';

        formData.set('date', subDateVal);
        console.log(subDateVal);
        formData.set('missingTeacherId', lesson.teacherId);
        formData.set('teacherId', subTeacherId);
        formData.set('subjectId', lesson.subjectId);
        formData.set('roomId', subRoomId);
        formData.set('classId', subClassId);
        formData.set('consolidated', String(subConsolidated));
        formData.set('cancelled', String(subCancelled));
        formData.set('lessonId', subLessonId);
        formData.set('lesson', lesson.lesson.toString());

        return async ({ result, update }) => {
          if (result.type === 'failure') {
            error = result.data?.message as string;
            success = null;
          } else if (result.type === 'success') {
            success =
              ((result.data?.data as { message: string }).message as string) ||
              'Sikeres importálás!';
            error = null;
          }

          update();
        };
      }}
      class="flex flex-col gap-3"
      action="?/newSubstitution"
      method="POST"
    >
      <div class="flex flex-row gap-3">
        <div class="w-full">
          <label for="input-date" class="text-white">Dátum</label>
          <input id="input-date" type="date" name="date" class="input" bind:value={subDate} />
        </div>

        <div class="w-full">
          <label for="input-class" class="text-white">Osztály</label>
          <select id="input-class" name="class" class="input" bind:value={subClassId}>
            <option value="" disabled selected>Válassz...</option>
            {#each data.classes as c}
              <option value={c.id}>{c.name}</option>
            {/each}
          </select>
        </div>

        <div class="w-full">
          <label for="input-lesson" class="text-white">Óra</label>
          <select id="input-lesson" name="lesson" class="input" bind:value={subLessonId}>
            <option value="" disabled selected>Válassz...</option>
            {#each lessons as l}
              <option value={l.id}
                >{l.lesson}. - {l.subject.name} - {l.teacher.name} ({l.group})</option
              >
            {/each}
          </select>
        </div>
      </div>
      <div class="flex flex-row gap-3">
        <div class="w-full">
          <label for="input-subteacher" class="text-white">Helyettesítő tanár</label>
          <select
            id="input-subteacher"
            name="subteacher"
            class="input"
            bind:value={subTeacherId}
            disabled={subCancelled}
          >
            <option value="" disabled selected>Válassz...</option>
            {#each data.teachers as t}
              <option value={t.id}>{t.name}</option>
            {/each}
          </select>
        </div>
        <div class="w-full">
          <label for="input-room" class="text-white">Terem</label>
          <select
            id="input-room"
            name="room"
            class="input"
            disabled={subCancelled}
            bind:value={subRoomId}
          >
            <option value="" disabled selected>Válassz...</option>
            {#each data.rooms as r}
              <option value={r.id}>{r.name}</option>
            {/each}
          </select>
        </div>
        <div class="flex w-full items-center justify-between gap-8">
          <span class="flex gap-2">
            <input
              id="input-consolidated"
              type="checkbox"
              name="consolidated"
              class="remove-focus h-5 w-5 rounded-md border-0 bg-black bg-opacity-30 text-petrik-1"
              bind:checked={subConsolidated}
            />
            <label for="input-consolidated" class="text-white">ÖVH</label>
          </span>
          <span class="flex gap-2">
            <input
              id="input-cancelled"
              type="checkbox"
              name="cancelled"
              class="remove-focus h-5 w-5 rounded-md border-0 bg-black bg-opacity-30 text-petrik-1"
              bind:checked={subCancelled}
            />
            <label for="input-cancelled" class="text-white">Elmarad</label>
          </span>
          <button type="submit" class="button">
            <Icon icon="akar-icons:plus" class="h-6 w-6" />
            Hozzáadás
          </button>
        </div>
      </div>
      {#if error}
        <div class="text-red-500">{error}</div>
      {/if}
      {#if success}
        <div class="text-green-500">{success}</div>
      {/if}
    </form>
  </div>
</main>
