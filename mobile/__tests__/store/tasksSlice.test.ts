import reducer, { addTask, mergeServerTasks, selectTasks } from '../../src/store/tasksSlice';
import { setupStore } from '../../src/store';

describe('tasksSlice', () => {
  it('starts with an empty task list', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state.items).toEqual([]);
  });

  it('adds a task with a trimmed description and a generated id', () => {
    const store = setupStore();
    store.dispatch(addTask('  Buy milk  '));
    const tasks = selectTasks(store.getState());
    expect(tasks).toHaveLength(1);
    expect(tasks[0].description).toBe('Buy milk');
    expect(tasks[0].id).toEqual(expect.any(String));
    expect(tasks[0].id.length).toBeGreaterThan(0);
  });

  it('rejects an empty or whitespace-only description', () => {
    const store = setupStore();
    store.dispatch(addTask(''));
    store.dispatch(addTask('   '));
    expect(selectTasks(store.getState())).toHaveLength(0);
  });

  it('keeps multiple tasks in insertion order', () => {
    const store = setupStore();
    store.dispatch(addTask('First'));
    store.dispatch(addTask('Second'));
    expect(selectTasks(store.getState()).map((t) => t.description)).toEqual(['First', 'Second']);
  });

  describe('mergeServerTasks', () => {
    it('adds backend descriptions that are not already present', () => {
      const store = setupStore();
      store.dispatch(addTask('Local'));
      store.dispatch(mergeServerTasks(['Local', 'From backend']));
      expect(selectTasks(store.getState()).map((t) => t.description)).toEqual(['Local', 'From backend']);
    });

    it('dedupes case-insensitively so an existing task is not duplicated', () => {
      const store = setupStore();
      store.dispatch(addTask('Buy milk'));
      store.dispatch(mergeServerTasks(['buy milk']));
      expect(selectTasks(store.getState())).toHaveLength(1);
    });

    it('ignores blank descriptions and trims the rest', () => {
      const store = setupStore();
      store.dispatch(mergeServerTasks(['  ', '  Trim me  ']));
      const tasks = selectTasks(store.getState());
      expect(tasks.map((t) => t.description)).toEqual(['Trim me']);
    });
  });
});
