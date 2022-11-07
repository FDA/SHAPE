import * as request from "request";
import * as functions from "firebase-functions";
import axios from "axios";
const AUTHCODE_REFRESH_URL = "https://api.1up.health/user-management/v1/user/auth-code";
const BEARER_TOKEN_URL = "https://api.1up.health/fhir/oauth2/token";
const USER_URL = "https://api.1up.health/user-management/v1/user";

const envVars = functions.config();

const _form = {
    app_user_id: "SHAPE Application",
    client_id: envVars.one_up_client_id.value,
    client_secret: envVars.one_up_client_secret.value
};

export const getUserList = (req: any, res: any) => {
    const localOptions = {
        url: USER_URL,
        form: {
            client_id: _form.client_id,
            client_secret: _form.client_secret
        },
        headers: {
            "Content-Type": "application/json"
        }
    };
    console.log(`In getUserList with ${localOptions.form.client_id}`);
    request.get(localOptions, function callback(err: any, httpResponse: any, body: any) {
        if (err) {
            console.error("Request failed:", err);
            res.send(err).status(500);
        }
        console.log("Create EHR  User responded with:", body);
        return res.send(body).status(200);
    });
};

export const getNewAuthCode = (req: any, res: any) => {
    const participantId = req.params[0];
    console.log(`Getting new auth code for ${JSON.stringify(participantId)}`);
    _form.app_user_id = participantId;
    const options = {
        url: AUTHCODE_REFRESH_URL,
        form: _form
    };
    console.log(`In getNewAuthCode with ${_form.client_id}`);
    console.log(`getting new auth token with ${JSON.stringify(options)}`);
    request.post(options, function callback(err: any, httpResponse: any, body: any) {
        console.log(`returned: ${body}`);
        if (err) {
            console.error("Request failed:", err);
            res.send(err).status(500);
        }
        console.log("Create EHR  User responded with:", body);
        return res.send(body).status(200);
    });
};

export const getUserCode = (req: any, res: any) => {
    const participantId = req.params[0];
    console.log(`Getting tokens for ${participantId}`);
    console.log(`All Parms: ${JSON.stringify(req.params)}`);
    _form.app_user_id = participantId;
    const options = {
        url: USER_URL,
        form: _form
    };
    console.log(`In getUserCode with ${_form.client_id}`);
    request.post(options, function optionalCallback(err: any, httpResponse: any, body: any) {
        console.log(`returned: ${body}`);
        if (err) {
            res.send(err).status(500);
        }
        console.log("Create EHR  User responded with:", body);
        return res.send(body).json().status(200);
    });
};

export const getBearerToken = (req: any, res: any) => {
    console.log(`getBearerToken All Parms: ${JSON.stringify(req.query)}`);
    const participantId = req.query.participantId;
    const code = req.query.code;
    console.log(`Getting bearer token for ${participantId} and code ${code}`);
    const localform = Object.assign({}, _form);
    localform.app_user_id = participantId;
    // @ts-ignore
    localform.code = code;
    // @ts-ignore
    localform.grant_type = "authorization_code";

    const options = {
        url: BEARER_TOKEN_URL,
        form: localform
    };
    console.log(`getting new bearer token with ${JSON.stringify(options)}`);
    request.post(options, function optionalCallback(err: any, httpResponse: any, body: any) {
        console.log(`returned: ${body}`);
        if (err) {
            res.send(err).status(500);
        }
        console.log("Create EHR  User responded with:", body);
        return res.send(body).status(200);
    });
};
/* Provider */
export const search = (req: any, res: any) => {
    const term = req.query.term;
    const token = req.query.token;
    const SEARCH_URL = `https://system-search.1up.health/api/search?query=${term}&only_health_systems=true`;
    const options = {
        url: SEARCH_URL,
        json: true,
        headers: { Authorization: `Bearer ${token}` }
    };
    console.log(`searching with ${JSON.stringify(options)}`);
    request.post(options, function callback(err: any, httpResponse: any, body: any) {
        if (err) {
            res.send(err).status(500);
        }
        console.log("Search responded with:", JSON.stringify(body));
        return res.send(body).status(200);
    });
};

export const getPatient = (req: any, res: any) => {
    const token = req.query.token;
    const ehrType = req.query.ehrType;
    console.log(`In getPatient with token ${token}`);
    const SEARCH_URL = `https://api.1up.health/fhir/${ehrType}/Patient/`;
    const options = {
        url: SEARCH_URL,
        json: true,
        headers: { Authorization: `Bearer ${token}` }
    };
    console.log(`getPatient with ${JSON.stringify(options)}`);
    request.get(options, function callback(err: any, httpResponse: any, body: any) {
        console.log(`returned: ${body}`);
        if (err) {
            res.send(err).status(500);
        }
        console.log("Search responded with:", body);
        return res.send(body).status(200);
    });
};

export const getPatientEHR = async (req: any, res: any) => {
    const patientId = req.query.patientId;
    const ehrType = req.query.ehrType;
    const token = req.query.token;
    console.log(`in getPatientEHR for ${patientId} and code ${token} and ehrType ${ehrType}`);
    const SEARCH_URL = `https://api.1up.health/fhir/${ehrType}/Patient/${patientId}/$everything?_count=100`;
    console.log(`SEARCH_URL is ${SEARCH_URL}`);
    let bulkResponse = {};
    const resp = await getEhrPart(token, SEARCH_URL);
    console.log(`resp is: ${JSON.stringify(resp)}`);
    const hasNext = getNext(resp);
    console.log(`hasNext is ${hasNext}`);
    bulkResponse = { ...bulkResponse, ...resp };
    if (resp.link) {
        let url = hasNext.url;
        let keepGoing = true;
        while (keepGoing) {
            console.log(`Getting next page at ${url}`);
            const nextPage = await getEhrPart(token, url);
            if (nextPage.entry) {
                nextPage.entry.forEach((item: any) => {
                    // @ts-ignore
                    bulkResponse.entry.push(item);
                });
            }
            const hasNextStep = await getNext(nextPage);
            keepGoing = hasNextStep && hasNextStep.url;
            if (keepGoing) {
                url = hasNextStep.url;
            }
        }
    }
    return res.send(bulkResponse).status(200);
};

const getEhrPart = async (token: any, url: any) => {
    const options = {
        json: true,
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    const payload = await axios.get(url, options);
    const { data } = payload;
    return data;
};

function getNext(jsonElement: any) {
    console.log(`jsonElement is ${JSON.stringify(jsonElement)}`);
    if (!jsonElement) {
        return null;
    }
    const { link } = jsonElement;
    console.log(`link is ${link}`);
    if (link) {
        const hasNext = link.filter((item: any) => {
            return item.relation === "next";
        });
        if (hasNext) {
            console.log(`Returning hasNext ${JSON.stringify(hasNext[0])}`);
            return hasNext[0];
        } else {
            return null;
        }
    } else {
        return null;
    }
}
