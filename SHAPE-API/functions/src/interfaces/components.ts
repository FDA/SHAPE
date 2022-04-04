export interface CallbackFunction {
   (error: boolean, response: ResponseData | ResponseData[] | any): any;
}

export interface ResponseData {
   id?: string,
   data?: any,
   returned?: any,
   deletedCount?: number,
}