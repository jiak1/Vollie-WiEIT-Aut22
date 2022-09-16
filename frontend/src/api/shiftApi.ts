import { isBasicResponse, patch, ResponseWithStatus, post, del, getDataResponse, ResponseWithData } from "./utility";
const ROOT_URL = window.location.origin;

async function patchBasicResponse(url: string): Promise<ResponseWithStatus> {
    let response: Response | null = null;
    try {
        response = await patch(url);
        const resp = (await response.json()) as unknown;
        if (!isBasicResponse(resp)) {
            throw new Error("Unexpected response format");
        }
        return { ...resp, status: response.status };
    } catch (error) {
        console.error(error);
        return { success: false, message: "An unexpected error occured", status: response?.status || 500 };
    }
}

// async function postBasicResponse(url: string, data: Record<string, unknown>): Promise<ResponseWithStatus> {
//     let response: Response | null = null;
//     try {
//         response = await post(url, data);
//         const resp = (await response.json()) as unknown;
//         if (!isBasicResponse(resp)) {
//             throw new Error("Unexpected response format");
//         }
//         return { ...resp, status: response.status };
//     } catch (error) {
//         console.error(error);
//         return { success: false, message: "An unexpected error occured", status: response?.status || 500 };
//     }
// }

async function deleteBasicResponse(url: string): Promise<ResponseWithStatus> {
    let response: Response | null = null;
    try {
        response = await del(url);
        const resp = (await response.json()) as unknown;
        if (!isBasicResponse(resp)) {
            throw new Error("Unexpected response format");
        }
        return { ...resp, status: response.status };
    } catch (error) {
        console.error(error);
        return { success: false, message: "An unexpected error occured", status: response?.status || 500 };
    }
}

interface AssignmentUserDetails {
    shiftid: string;
    userid: string;
}

export async function assignUserToShift(req: AssignmentUserDetails): Promise<ResponseWithStatus> {
    return patchBasicResponse(`${ROOT_URL}/api/shifts/${req.shiftid}/assign-user/${req.userid}`);
}

export async function unassignUserFromShift(req: AssignmentUserDetails): Promise<ResponseWithStatus> {
    return patchBasicResponse(`${ROOT_URL}/api/shifts/${req.shiftid}/unassign-user/${req.userid}`);
}

export interface IShift extends Document {
    _id: string;
    name: string;
    startAt: Date;
    endAt: Date;
    venue: string;
    address: string;
    description: string;
    notes: string;
    users: Array<string>;
    category: "School Outreach" | "Event" | "Committee" | "Other";
    requiresWWCC: boolean;
    numGeneralVolunteers: number;
    numUndergradAmbassadors: number;
    numPostgradAmbassadors: number;
    numStaffAmbassadors: number;
    numSprouts: number;
}

export async function createShift(shiftBody: object): Promise<ResponseWithData<IShift | null>> {
    try {
        const response = await post(`${ROOT_URL}/api/shifts/create`, { ...shiftBody });
        const resp = (await response.json()) as ResponseWithData<IShift>;
        if (!isBasicResponse(resp)) {
            throw new Error("Unexpected response format");
        }
        return { ...resp };
    } catch (error) {
        console.error(error);
        return { success: false, message: "An unexpected error occured", data: null };
    }
}

interface DeleteDetails {
    _id: string;
}

export function deleteShift(req: DeleteDetails): Promise<ResponseWithStatus> {
    return deleteBasicResponse(`${ROOT_URL}/api/shifts/${req._id}`);
}

export async function getAvailableShifts(): Promise<ResponseWithData<IShift[]>> {
    return await getDataResponse(`${ROOT_URL}/api/shifts/get-available-shifts`);
}

export async function getAllShifts(): Promise<ResponseWithData<IShift[]>> {
    return await getDataResponse(`${ROOT_URL}/api/shifts/get-all-shifts`);
}

// being explicit with undefined check for userId, for why, see type safety with enabled
// https://tkdodo.eu/blog/react-query-and-type-script
export async function getMyShifts(userId: string | undefined): Promise<ResponseWithData<IShift[]>> {
    return typeof userId === "undefined"
        ? Promise.reject(new Error("Invalid id"))
        : await getDataResponse(`${ROOT_URL}/api/shifts/get-user-shifts/${userId}`);
}

export async function getShiftById(shiftId: string): Promise<ResponseWithData<IShift>> {
    return await getDataResponse(`${ROOT_URL}/api/shifts/shift/${shiftId}`);
}

export interface AttendaceSummary {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    volunteerType: string;
}

export async function getShiftAttendanceList(shiftId: string): Promise<ResponseWithData<AttendaceSummary[]>> {
    return await getDataResponse(`${ROOT_URL}/api/shifts/attendance-list/${shiftId}`);
}
