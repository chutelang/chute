<script setup lang="ts">
import { ref, computed } from "vue";
import { compile } from "../../../../packages/compiler/src/pipeline.ts";

const props = defineProps<{
  source: string;
}>();

type Tab = "chute" | "plist" | "shortcuts";

const activeTab = ref<Tab>("chute");

const compiled = computed(() => {
  try {
    return { plist: compile(props.source).main, error: "" };
  } catch (e) {
    return { plist: "", error: e instanceof Error ? e.message : String(e) };
  }
});

const tabs = computed(() => {
  const list: Array<{ key: Tab; label: string; available: boolean }> = [
    { key: "chute", label: "Chute", available: true },
    { key: "plist", label: "Plist", available: true },
    { key: "shortcuts", label: "Shortcuts", available: false },
  ];
  return list;
});

function selectTab(tab: Tab) {
  const entry = tabs.value.find((t) => t.key === tab);
  if (entry?.available) {
    activeTab.value = tab;
  }
}
</script>

<template>
  <div class="chute-code">
    <div class="chute-code-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'chute-code-tab',
          {
            active: activeTab === tab.key,
            disabled: !tab.available,
          },
        ]"
        :disabled="!tab.available"
        :title="tab.available ? '' : 'Coming soon'"
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="chute-code-content">
      <div v-show="activeTab === 'chute'" class="chute-code-panel">
        <div class="language-chute vp-adaptive-theme">
          <button class="copy" title="Copy Code" />
          <pre><code>{{ source }}</code></pre>
        </div>
      </div>
      <div v-show="activeTab === 'plist'" class="chute-code-panel">
        <div v-if="compiled.error" class="chute-code-error">{{ compiled.error }}</div>
        <div v-else class="language-xml vp-adaptive-theme">
          <button class="copy" title="Copy Code" />
          <pre><code>{{ compiled.plist }}</code></pre>
        </div>
      </div>
      <div v-show="activeTab === 'shortcuts'" class="chute-code-panel">
        <div class="chute-code-placeholder">
          Shortcuts preview coming soon
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chute-code {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.chute-code-tabs {
  display: flex;
  background: var(--vp-code-tab-bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.chute-code-tab {
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.chute-code-tab:hover:not(.disabled) {
  color: var(--vp-c-text-1);
}

.chute-code-tab.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.chute-code-tab.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chute-code-content {
  background: var(--vp-code-block-bg);
}

.chute-code-panel pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
}

.chute-code-panel code {
  font-family: var(--vp-font-family-mono);
  font-size: var(--vp-code-font-size);
  line-height: var(--vp-code-line-height);
}

.chute-code-error {
  padding: 16px;
  color: var(--vp-c-danger-1);
  font-family: var(--vp-font-family-mono);
  font-size: var(--vp-code-font-size);
}

.chute-code-placeholder {
  padding: 32px 16px;
  text-align: center;
  color: var(--vp-c-text-3);
  font-style: italic;
}
</style>
