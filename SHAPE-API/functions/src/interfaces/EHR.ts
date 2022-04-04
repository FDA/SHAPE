interface Profile {
    dob: string,
    gender: string,
    id: string,
    isNew: boolean,
    name: string
}

interface EHRData {
    ehrType: string,
    id: string,
    logo: string,
    name: string,
}

interface Receipt {
    ehr: EHRData,
    path: string,
    profile: Profile
}

export interface EHR {
    id?: string,
    receipts: Receipt[],
    org: string,
    participantId: string,
    timestamp: string,
}
