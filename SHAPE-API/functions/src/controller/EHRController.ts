import {Request, Response} from "express";
import {databaseError, successResponse, notAllowed, insufficientParameters} from "../common/utils";
import {EHRService} from "../service";

export class EHRController {

    private ehrService = new EHRService();

    public create(req: Request, res: Response) {
        notAllowed("Method not permitted by this API.", res);
    }

    public getAll(req: Request, res: Response) {
        // @ts-ignore
        const org = req.org;
        this.ehrService.getAll(org, (error: boolean, data: any) => {
            if (error) {
                databaseError(data, res);
            } else {
                successResponse("get all ehr receipts successful", data, res);
            }
        })
    }

    public findOne(req: Request, res: Response) {
        // @ts-ignore
        const org = req.org;
        if (req.body.path) {
            this.ehrService.find(
                org,
                req.body.path,
                (error: boolean, data: any) => {
                    if (error) {
                        databaseError(data, res);
                    } else {
                        successResponse("found ehr record", data, res);
                    }
                }
            )
        } else {
            insufficientParameters(res);
        }
    }

    public get(req: Request, res: Response) {
        // @ts-ignore
        const org = req.org;
        if (req.params.respondentId && req.params.participantName && req.params.dob) {
            const params = {
                respondentId: req.params.respondentId,
                participantName: req.params.participantName,
                dob: req.params.dob
            };
            this.ehrService.get(org, params, (error: boolean, data: any) => {
                if (error) {
                    databaseError(data, res);
                } else {
                    successResponse("get ehr successful", data, res);
                }
            })
        } else {
            insufficientParameters(res);
        }
    }
    public delete(req: Request, res: Response) {
        notAllowed("Method not permitted by this API.", res);
    }

    public update(req: Request, res: Response) {
        notAllowed("Method not permitted by this API.", res);
    }


}
