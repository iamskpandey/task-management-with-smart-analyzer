export const Render = {
  // Update the Staging List (Left Side)
  stagingArea(tasks) {
    const listEl = document.getElementById("staging-list");
    const countEl = document.getElementById("staging-count");

    countEl.innerText = tasks.length;

    if (tasks.length === 0) {
      listEl.innerHTML = `<li class="list-group-item text-center text-muted border-0 py-4"><small>No tasks added.</small></li>`;
      return;
    }

    listEl.innerHTML = tasks
      .map(
        (t) => `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-light mb-2 rounded border-0">
                <div class="text-truncate me-2">
                    <span class="fw-bold text-dark">${t.title}</span>
                    <br><small class="text-muted">Imp: ${t.importance} | ${t.estimated_hours}h</small>
                </div>
                <button class="btn btn-sm btn-outline-danger border-0" onclick="window.removeTask(${t.id})">&times;</button>
            </li>
        `
      )
      .join("");
  },

  // Render Result Cards (Right Side)
  results(tasks, isSuggestion = false) {
    const container = document.getElementById("slot-results");

    // Inject wrapper class for styling
    const wrapperClass = isSuggestion ? "suggestion-mode" : "";

    const html = tasks
      .map((t) => {
        let borderClass = "priority-low";
        if (t.score >= 80) borderClass = "priority-high";
        else if (t.score >= 50) borderClass = "priority-med";

        return `
            <div class="card mb-3 shadow-sm border-0 border-start border-left-lg ${borderClass} card-hover fade-in">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="card-title mb-0 text-dark">${t.title}</h5>
                        <span class="badge bg-light text-dark border fs-6">${
                          t.score
                        }</span>
                    </div>
                    <div class="d-flex gap-3 small text-secondary mb-2">
                        <span>📅 ${t.due_date || "N/A"}</span>
                        <span>⏱ ${t.estimated_hours}h</span>
                        <span>⭐ ${t.importance}/10</span>
                    </div>
                    <div class="alert alert-light py-1 px-2 mb-0 small border">
                        <i class="bi bi-info-circle"></i> 
                        Urgency: ${Math.round(t.breakdown.urgency_score)} | 
                        Effort: ${Math.round(t.breakdown.effort_score)}
                    </div>
                </div>
            </div>`;
      })
      .join("");

    container.innerHTML = `<div class="${wrapperClass}">${html}</div>`;
  },

  // Toggle Visibility (Loader / Errors)
  toggleState(state) {
    const states = ["slot-loading", "slot-error", "slot-results"];
    states.forEach((id) => document.getElementById(id).classList.add("d-none"));

    if (state) document.getElementById(state).classList.remove("d-none");
  },

  showError(msg) {
    this.toggleState("slot-error");

    const element = document.getElementById("error-text");
    if (element) {
      element.innerText = msg;
    } else {
      const slot = document.getElementById("slot-error");
      slot.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error:</strong> ${msg}
                </div>
            `;
    }
  },
};
