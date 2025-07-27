// import { PT_Sans_Narrow } from "next/font/google";
import { z } from "zod";


export const usernameValidation = z.
string().min(2, "Username must be atleast 2 characters")
.max(20, "Username should not exceed 20 characters")
.regex(/^[a-zA-Z0-9_]+$/, "Username Should not contain special characters")

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "Invalid Email Address"}),
    password: z.string().min(6, {message: "Password must be atleast 6 characters"})
})