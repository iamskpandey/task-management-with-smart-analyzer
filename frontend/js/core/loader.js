export class ComponentLoader {
  constructor(componentMap) {
    this.map = componentMap;
  }

  async loadAll() {
    const promises = Object.entries(this.map).map(
      async ([slotId, filePath]) => {
        await this.loadOne(slotId, filePath);
      }
    );

    await Promise.all(promises);
  }

  async loadOne(slotId, filePath) {
    const element = document.getElementById(slotId);
    if (!element) {
      console.warn(`️Slot not found: ${slotId}`);
      return;
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      element.innerHTML = html;
    } catch (error) {
      console.error(`Failed to load view: ${filePath}`, error);
      element.innerHTML = `<div class="alert alert-danger">Error loading component</div>`;
    }
  }
}
