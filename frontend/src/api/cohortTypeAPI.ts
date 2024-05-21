import {
    ResponseWithData,
    ResponseWithStatus,
    deleteAndGetBasicResponse,
    getDataResponse,
    isBasicResponse,
    post,
    // isBasicResponse,
    // post,
    // postAndGetBasicResponse,
} from "./utility";

export interface ICohort {
    _id: string;
    name: string;
    startDate: Date; //start date for the session
    endDate: Date; //end date for the session
}

export interface NewICohort {
    _id: string;
    name: string;
    startDate: Date; //start date for the session
    endDate: Date; //end date for the session
    user: string;
}

const PATH = `${window.location.origin}/api`;

//getting all cohorts
export async function getAllCohorts(): Promise<ResponseWithData<ICohort[]>> {
    return getDataResponse(`${PATH}/cohort/cohort-all`);
}

// export async function createCohort(
//     name: string,
//     startDate: Date, //start date for the session
//     endDate: Date, //end date for the session
//     userId?: string
// ): Promise<ResponseWithStatus> {
//     const payload: NewICohort = {
//         _id: "",
//         user: userId || "",
//         name,
//         startDate,
//         endDate,
//     };
//     return await postAndGetBasicResponse(`${PATH}/cohort/create`, payload as unknown as Record<string, unknown>);
// }

export async function createCohort(cohortBody: object): Promise<ResponseWithData<ICohort | null>> {
    try {
        const response = await post(`${PATH}/cohort/create`, { ...cohortBody });
        const resp = (await response.json()) as ResponseWithData<ICohort>;
        if (!isBasicResponse(resp)) {
            throw new Error("Unexpected response format");
        }
        return { ...resp };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error creating qualification type.", data: null };
    }
}

export default function deleteCohort(cohortId: string): Promise<ResponseWithStatus> {
    return deleteAndGetBasicResponse(`${PATH}/cohort/${cohortId}`);
}

export async function getCohortsForUser(userId: string | undefined): Promise<ResponseWithData<ICohort[]>> {
    return typeof userId === "undefined"
        ? Promise.reject(new Error("Invalid id"))
        : getDataResponse(`${PATH}/cohort/cohortById/${userId}`);
}
