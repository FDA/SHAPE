//Utility class for logging out the state changes to the
//Redux store
export const logger = store => next => action => {
    if(process.env.NODE_ENV === "development") console.group(action.type);
    if(process.env.NODE_ENV === "development") console.info('dispatching', action);
    let result = next(action);
    if(process.env.NODE_ENV === "development") console.log('next state', store.getState());
    if(process.env.NODE_ENV === "development") console.groupEnd(action.type);

    return result;
};
export default logger;
