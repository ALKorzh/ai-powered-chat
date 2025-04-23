import {authorizationSchema} from "../constants/constants.js";

export const validateAuthorization = (email, password) => {
    const result = authorizationSchema.safeParse({email, password})

    if(!result.success) {
        return result.error.flatten().fieldErrors
    }

    return null
}