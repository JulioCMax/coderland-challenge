import { store, persistor } from '../../src/store';
import { addTask, selectTasks } from '../../src/store/tasksSlice';

describe('persisted store', () => {
  it('exposes a persistor with a purge method', () => {
    expect(typeof persistor.purge).toBe('function');
  });

  it('still reduces addTask correctly through the persisted reducer', () => {
    store.dispatch(addTask('Persisted-store task'));
    expect(selectTasks(store.getState()).some((t) => t.description === 'Persisted-store task')).toBe(true);
  });
});
