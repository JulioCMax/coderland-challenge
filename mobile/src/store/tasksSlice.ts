import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import type { Task } from '../types/task';
import type { RootState } from './index';

interface TasksState {
  items: Task[];
}

const initialState: TasksState = { items: [] };

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: {
      reducer(state, action: PayloadAction<Task>) {
        if (!action.payload.description) {
          return; // guard: empty descriptions are rejected
        }
        state.items.push(action.payload);
      },
      prepare(description: string) {
        return { payload: { id: nanoid(), description: description.trim() } };
      },
    },
    // Merges the task list returned by the backend sync into the local list, adding
    // only descriptions not already present (case-insensitive, matching the backend's
    // dedup) so tasks created directly on the backend show up without ever dropping a
    // local, possibly offline-created one.
    mergeServerTasks: {
      reducer(state, action: PayloadAction<Task[]>) {
        const seen = new Set(state.items.map((task) => task.description.toLowerCase()));
        for (const task of action.payload) {
          const key = task.description.toLowerCase();
          if (task.description && !seen.has(key)) {
            state.items.push(task);
            seen.add(key);
          }
        }
      },
      prepare(descriptions: string[]) {
        return { payload: descriptions.map((description) => ({ id: nanoid(), description: description.trim() })) };
      },
    },
  },
});

export const { addTask, mergeServerTasks } = tasksSlice.actions;
export default tasksSlice.reducer;

export const selectTasks = (state: RootState): Task[] => state.tasks.items;
