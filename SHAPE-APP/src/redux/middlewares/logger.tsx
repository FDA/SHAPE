//Utility class for logging out the state changes to the
//Redux store
export const logger = (/*store: any*/) => (next: any) => (action: any) => {
  // console.group(action.type);
  // console.info('dispatching', action);
  // console.log('next state', store.getState());
  // console.groupEnd(action.type);

  return next(action);
};
export default logger;
