import { v4 as uuidv4 } from "uuid";

export const isEmptyObject = (obj: any) => {
    if (
        obj === undefined ||
        obj === null ||
        obj === '' ||
        obj.length === 0 ||
        obj === 'NaN'
    ) {
        return true;
    }
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const guid = () => {
  return uuidv4();
};