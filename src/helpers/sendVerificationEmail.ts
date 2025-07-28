import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> 
{
    try {
        // Validate inputs
        if (!email || !username || !verifyCode) {
            return {
                success: false, 
                message: "Email, username, and verification code are required"
            };
        }

        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY environment variable is not set");
            return {
                success: false, 
                message: "Email service is not configured"
            };
        }

        console.log(`Email service called for ${email} (verification bypassed)`);
        
        const emailData = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'AnonChat | Verification Code',
            react: VerificationEmail({username, otp: verifyCode}),
        });

        console.log('Email sent successfully:', emailData);
        return {
            success: true, 
            message: "Verification Email Sent Successfully"
        };

    } catch (emailError: any) {
        console.error("Error Sending Verification Email:", emailError);
        
        // Handle specific email service errors
        if (emailError.message?.includes('API key')) {
            return {
                success: false, 
                message: "Invalid email service configuration"
            };
        }

        if (emailError.message?.includes('rate limit')) {
            return {
                success: false, 
                message: "Email rate limit exceeded. Please try again later."
            };
        }

        return {
            success: false, 
            message: `Failed to send verification email: ${emailError.message || 'Unknown error'}`
        };
    }    
}
