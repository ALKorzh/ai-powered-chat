import {registrationSchema} from "../constants/constants.js";

export const validateRegistration = (username, email, password, confirmPassword) => {
    const result = registrationSchema.safeParse({username, email, password, confirmPassword})

    if(!result.success) {
        return result.error.flatten().fieldErrors
    }

    return null
}