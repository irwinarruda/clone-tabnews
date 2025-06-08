<script lang="ts" setup>
import Card from "~/components/Card.vue";
import type { StatusData } from "~/server/api/v1/status";

type Status = "operational" | "critical" | "warning" | "unknown";

const styles = {
  statusIcon: {
    operational: "bg-green-500",
    critical: "bg-red-500",
    warning: "bg-yellow-500",
    unknown: "bg-gray-500",
  },
  statusBadge: {
    operational: "bg-green-100 text-green-800",
    critical: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    unknown: "bg-gray-100 text-gray-800",
  },
  progressBar: {
    operational: "bg-green-500",
    critical: "bg-red-500",
    warning: "bg-yellow-500",
    unknown: "bg-gray-500",
  },
} as const;

const { data, error, refresh } = useFetch<StatusData>("/api/v1/status", {
  retryDelay: 2000,
});
useInterval(refresh, 2000);

const databaseStatus = computed(() => {
  if (!data.value) return "unknown";
  const db = data.value.dependencies.database;
  const connectionRatio = db.opened_connections / db.max_connections;
  if (connectionRatio > 0.95) return "critical";
  if (connectionRatio > 0.8) return "warning";
  return "operational";
});

const overallStatus = computed(() => {
  if (!data.value) return "unknown";
  if (databaseStatus.value === "critical") return "critical";
  if (databaseStatus.value === "warning") return "warning";
  return "operational";
});

function getStyleForStatus(status: Status, styleType: keyof typeof styles) {
  return styles[styleType][status];
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-gray-900">System Status</h1>
        <p class="text-gray-600">Real-time monitoring of all services</p>
      </div>

      <Card>
        <div class="flex items-center gap-3">
          <div
            :class="[
              'w-3 h-3 rounded-full',
              getStyleForStatus(overallStatus, 'statusIcon'),
            ]"
          />
          <span class="text-2xl font-semibold">Overall System Status</span>
          <span
            :class="[
              'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold',
              getStyleForStatus(overallStatus, 'statusBadge'),
            ]"
          >
            {{ overallStatus.toUpperCase() }}
          </span>
        </div>
        <div class="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <Icon name="ph:clock" class="h-4 w-4" />
            <span
              >Last updated:
              {{
                data ? new Date(data.updated_at).toLocaleString() : "Unknown"
              }}</span
            >
          </div>
          <div class="flex items-center gap-1">
            <Icon name="ph:activity" class="h-4 w-4" />
            <span>Auto-refreshing every 2 seconds</span>
          </div>
        </div>
      </Card>

      <div v-if="error" class="rounded-lg border-red-200 bg-red-50 p-4">
        <div class="flex items-center gap-2 text-red-800">
          <Icon name="ph:warning-circle" class="h-5 w-5" />
          <span
            >Unable to fetch live data: {{ error.message }}. Showing cached
            data.</span
          >
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card v-if="data?.dependencies.database">
          <div class="flex items-center gap-2">
            <Icon name="ph:database" class="h-5 w-5" />
            <span class="font-semibold">Database</span>
            <div
              :class="[
                'w-2 h-2 rounded-full ml-auto',
                getStyleForStatus(databaseStatus, 'statusIcon'),
              ]"
            />
          </div>
          <div class="mt-4 space-y-3">
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Version</span>
                <span class="font-medium">{{
                  data?.dependencies.database.version
                }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Connections</span>
                <span class="font-medium">
                  {{ data?.dependencies.database.opened_connections }} /
                  {{ data?.dependencies.database.max_connections }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  :class="[
                    'h-2 rounded-full',
                    getStyleForStatus(databaseStatus, 'progressBar'),
                  ]"
                  :style="{
                    width: `${(data?.dependencies.database.opened_connections / data?.dependencies.database.max_connections) * 100}%`,
                  }"
                />
              </div>
            </div>
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <Icon name="ph:check-circle" class="h-3 w-3" />
              <span>Operational</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
