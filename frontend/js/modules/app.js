import { API } from "../services/api.js";
import { Render } from "./render.js";
import { bus } from "../core/eventbus.js";

// State
let taskList = [];

export function initializeApp() {
  console.log("✅ Logic Initialized");
  setupTabs();
  setupForm();
  setupActions();
  setupEventWiring();

  // Global helper for the "Remove" button in HTML string
  window.removeTask = (id) => {
    taskList = taskList.filter((t) => t.id !== id);
    bus.emit("state:updated", taskList);
  };
}

function setupEventWiring() {
  bus.on("state:updated", (tasks) => Render.stagingArea(tasks));
  bus.on("ui:loading", () => Render.toggleState("slot-loading"));
  bus.on("ui:success", ({ data, isSuggest }) => {
    Render.results(data, isSuggest);
    Render.toggleState("slot-results");
  });
  bus.on("ui:error", (msg) => Render.showError(msg));
}

function setupTabs() {
  const tabs = document.querySelectorAll(".nav-link");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      // Active Class Toggle
      tabs.forEach((t) => t.classList.remove("active"));
      e.target.closest(".nav-link").classList.add("active");

      // Form Visibility Toggle
      const targetId = e.target.closest(".nav-link").dataset.target;
      document.getElementById("form-single").classList.add("d-none");
      document.getElementById("form-bulk").classList.add("d-none");
      document.getElementById(targetId).classList.remove("d-none");
    });
  });
}

function setupForm() {
  document.getElementById("form-single").addEventListener("submit", (e) => {
    e.preventDefault();

    const rawDate = document.getElementById("inp-date").value;
    const rawDeps = document.getElementById("inp-deps").value;

    const newTask = {
      id: Date.now(),
      title: document.getElementById("inp-title").value,

      // If rawDate is empty string "", this becomes undefined.
      // JSON.stringify() removes undefined keys, so the backend receives nothing.
      due_date: rawDate || undefined,

      estimated_hours:
        parseFloat(document.getElementById("inp-hours").value) || 1,
      importance: parseInt(document.getElementById("inp-imp").value) || 5,

      dependencies: rawDeps
        ? rawDeps
            .split(",")
            .map((n) => parseInt(n.trim()))
            .filter((n) => !isNaN(n))
        : [],
    };

    taskList.push(newTask);
    bus.emit("state:updated", taskList);

    // Reset Form
    e.target.reset();
    document.getElementById("inp-imp").value = 5;
  });

  const btnLoad = document.getElementById("btn-load-json");
  if (btnLoad) {
    btnLoad.addEventListener("click", () => {
      const jsonInput = document.getElementById("inp-json");
      const rawValue = jsonInput.value.trim();

      if (!rawValue) return alert("Please paste some JSON first!");

      try {
        const parsed = JSON.parse(rawValue);
        if (!Array.isArray(parsed))
          throw new Error("JSON must be an array [...]");

        const newTasks = parsed.map((t, index) => ({
          id: Date.now() + index,
          title: t.title || "Untitled Task",
          due_date: t.due_date || undefined,
          estimated_hours: parseFloat(t.estimated_hours) || 1,
          importance: parseInt(t.importance) || 5,
          dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
        }));

        taskList.push(...newTasks);

        // Update UI
        bus.emit("state:updated", taskList);

        jsonInput.value = "";
      } catch (err) {
        alert("Invalid JSON: " + err.message);
      }
    });
  }
}

function setupActions() {
  // Helper to merge Single List + Bulk JSON
  const getPayload = () => {
    const bulkVal = document.getElementById("inp-json").value;
    let bulkTasks = [];
    try {
      if (bulkVal) bulkTasks = JSON.parse(bulkVal);
    } catch (e) {
      alert("Invalid JSON");
      return null;
    }
    return [...taskList, ...bulkTasks];
  };

  const runAnalysis = async (isSuggest) => {
    const payload = getPayload();
    if (!payload || payload.length === 0) return alert("Add tasks first!");

    bus.emit("ui:loading");

    try {
      const strategy = document.getElementById("strategy-select").value;
      const data = isSuggest
        ? await API.suggest(payload)
        : await API.analyze(payload, strategy);

      bus.emit("ui:success", { data, isSuggest });
    } catch (err) {
      bus.emit("ui:error", err.message);
    }
  };

  document
    .getElementById("btn-analyze")
    .addEventListener("click", () => runAnalysis(false));
  document
    .getElementById("btn-suggest")
    .addEventListener("click", () => runAnalysis(true));
}
