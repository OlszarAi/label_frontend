// Save manager to prevent race conditions between auto-save and manual save
export class SaveManager {
  private static instance: SaveManager;
  private savePromises = new Map<string, Promise<unknown>>();
  private saveTimers = new Map<string, NodeJS.Timeout>();
  
  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  // Debounced save with mutex to prevent multiple simultaneous saves
  async debouncedSave<T>(
    key: string, 
    saveFunction: () => Promise<T>, 
    delay: number = 1000
  ): Promise<T | null> {
    // Clear existing timer for this key
    const existingTimer = this.saveTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // If there's already a pending save for this key, return it
    const existingSave = this.savePromises.get(key);
    if (existingSave) {
      console.log(`🔄 Save already in progress for ${key}, waiting...`);
      return existingSave as Promise<T>;
    }

    // Create a new debounced save
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          console.log(`💾 Starting save for ${key}`);
          
          // Create and store the save promise
          const savePromise = saveFunction();
          this.savePromises.set(key, savePromise);
          
          const result = await savePromise;
          
          // Clean up
          this.savePromises.delete(key);
          this.saveTimers.delete(key);
          
          console.log(`✅ Save completed for ${key}`);
          resolve(result);
        } catch (saveError) {
          console.error(`❌ Save failed for ${key}:`, saveError);
          
          // Clean up on error
          this.savePromises.delete(key);
          this.saveTimers.delete(key);
          
          reject(saveError);
        }
      }, delay);

      this.saveTimers.set(key, timer);
    });
  }

  // Immediate save with mutex (for manual saves)
  async immediateSave<T>(
    key: string, 
    saveFunction: () => Promise<T>
  ): Promise<T> {
    // Cancel any pending debounced save
    const existingTimer = this.saveTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.saveTimers.delete(key);
      console.log(`🛑 Cancelled auto-save for ${key} due to manual save`);
    }

    // If there's already a save in progress, wait for it
    const existingSave = this.savePromises.get(key);
    if (existingSave) {
      console.log(`⏳ Waiting for existing save to complete for ${key}`);
      try {
        await existingSave;
      } catch {
        console.log(`🔄 Previous save failed, proceeding with new save for ${key}`);
      }
    }

    // Perform immediate save
    console.log(`🚀 Starting immediate save for ${key}`);
    const savePromise = saveFunction();
    this.savePromises.set(key, savePromise);

    try {
      const result = await savePromise;
      this.savePromises.delete(key);
      console.log(`✅ Immediate save completed for ${key}`);
      return result;
    } catch (saveError) {
      this.savePromises.delete(key);
      console.error(`❌ Immediate save failed for ${key}:`, saveError);
      throw saveError;
    }
  }

  // Cancel all pending saves for a key
  cancelSave(key: string): void {
    const timer = this.saveTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.saveTimers.delete(key);
      console.log(`🛑 Cancelled pending save for ${key}`);
    }
  }

  // Check if save is in progress
  isSaving(key: string): boolean {
    return this.savePromises.has(key);
  }
}
