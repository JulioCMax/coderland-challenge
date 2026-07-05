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
  },
});

export const { addTask } = tasksSlice.actions;
export default tasksSlice.reducer;

export const selectTasks = (state: RootState): Task[] => state.tasks.items;
