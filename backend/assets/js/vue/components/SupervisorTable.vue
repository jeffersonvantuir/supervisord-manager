<template>
  <div>
    <table class="min-w-full table-auto border-collapse">
      <thead>
      <tr>
        <th class="border p-2">Grupo</th>
        <th class="border p-2">Nome</th>
        <th class="border p-2">Log de Arquivo</th>
        <th class="border p-2">Data de Início</th>
        <th class="border p-2">Data de Parada</th>
        <th class="border p-2">Estado</th>
        <th class="border p-2">Em Execução</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(process, index) in processes" :key="index">
        <td class="border p-2">{{ process.group }}</td>
        <td class="border p-2">{{ process.name }}</td>
        <td class="border p-2">{{ process.logfile }}</td>
        <td class="border p-2">{{ process.start_datetime }}</td>
        <td class="border p-2">{{ process.stop_datetime }}</td>
        <td class="border p-2">{{ process.state === 0 ? 'Parado' : 'Em Execução' }}</td>
        <td class="border p-2">{{ process.isRunning ? 'Sim' : 'Não' }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      processes: []
    };
  },
  created() {
    // Fetch data from the supervisor endpoint when the component is created
    fetch('/supervisor')
        .then(response => response.json())
        .then(data => {
          this.processes = data[0].processes;
        })
        .catch(error => console.error('Erro ao carregar os dados:', error));
  }
};
</script>

<style scoped>
/* Você pode adicionar estilos específicos do componente aqui, se necessário */
</style>
