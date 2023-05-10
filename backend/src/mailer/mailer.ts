import * as nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { Logger } from "tslog";
import { EMAIL_USER, SITE_NAME, HOST, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME } from "../constants";
import { generateOTPForUser } from "../otps/otpManager";
import User from "../User/user.model";

const logger = new Logger({ name: "mailer" });

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
    },
});

export async function sendOTPEmail(userFirstName: string, userEmail: string): Promise<void> {
    const userOTP = generateOTPForUser(userEmail);
    logger.debug(`OTP for '${userEmail}': ${userOTP}`);
    const content = `Hey ${userFirstName},\n\nHere's the one time password you requested:\n${userOTP}`;
    return await sendEmail(`Your ${SITE_NAME} One Time Password`, content, userEmail);
}
export async function sendSignedUpShiftEmail(
    userFirstName: string,
    userEmail: string,
    shiftName: string,
    shiftLocation: string,
    shiftStartTime: Date,
    shiftEndTime: Date
): Promise<void> {
    logger.debug(`Sending shift signup email for '${userEmail}' for shift ''${shiftName}`);
    const content =
        `Hey ${userFirstName},\n\n` +
        `You've signed up for the shift '${shiftName}' at ${shiftLocation} from ${shiftStartTime} to ${shiftEndTime}. See you there!`;
    const ccEmails = await getAdminEmails();
    return await sendEmail(`Your ${SITE_NAME} Shift Details`, content, userEmail, ccEmails);
}
export async function sendCancelledShiftEmail(
    userFirstName: string,
    userEmail: string,
    shiftName: string,
    shiftLocation: string,
    shiftStartTime: Date
): Promise<void> {
    logger.debug(`Sending shift cancelled email for '${userEmail}' for shift ''${shiftName}`);
    const content = `Hey ${userFirstName},\n\nYour shift '${shiftName}' at ${shiftStartTime} at ${shiftLocation} was cancelled.`;
    const ccEmails = await getAdminEmails();
    return await sendEmail(`Your ${SITE_NAME} Shift Has Been Cancelled`, content, userEmail, ccEmails);
}

export async function sendQualificationExpiryEmail(
    userFirstName: string,
    userLastName: string,
    userId: string,
    email: string | string[],
    qualTitle: string
): Promise<void> {
    logger.debug(
        `Sending qualification expiry email for ${userFirstName} ${userLastName} for expired qualification '${qualTitle}`
    );
    const content = `Dear ${SITE_NAME}administrator,\n\nThis email is to let you know that a qualification (${qualTitle}) 
    of user ${userFirstName} ${userLastName} has expired.\n You can visit their page (${HOST}/profile/${userId}) to revoke 
    approval for this qualification.\n`;
    return await sendEmail(`Volunteer qualification expiry notification (${userId})`, content, email);
}

/** Send an email with the provided parameters.
 * @param subject The subject / title of the email
 * @param content The content / body of the email (can be pure string or HTML as string)
 * @param toEmail Can be a single address (string) or multiple (string array)
 * @param ccEmail Can be a single address (string) or multiple (string array)
 * @param isHTML If the content variable is meant to be treated as HTML or not */
async function sendEmail(
    subject: string,
    content: string,
    toEmail: string | string[],
    ccEmail: string | string[] = "",
    isHTML = false
): Promise<void> {
    // check if the addresses are just string (which means they're a single address)
    // else, do a join on the string array to make into a string :)
    const toEmails = typeof toEmail === "string" ? toEmail : toEmail.join(", ");
    const ccEmails = typeof ccEmail === "string" ? ccEmail : ccEmail.join(", ");
    const options: MailOptions = {
        from: EMAIL_USER,
        to: toEmails,
        cc: ccEmails,
        subject,
        // Only set either text or html, but not both
        text: !isHTML ? content : undefined,
        html: isHTML ? content : undefined,
    };

    try {
        const sentMessageInfo = await transporter.sendMail(options);
        // TODO: Re-enable error logging!
        if (sentMessageInfo.rejected) {
            // logger.error(`Email to '${toEmails}' was rejected...`);
        }
    } catch (error: unknown) {
        logger.error(error);
    }
}

async function getAdminEmails(): Promise<string | string[]> {
    const adminEmail = await User.find({ isAdmin: true }).exec();
    const emails = [];
    for (let i = 0; i < adminEmail.length; i++) {
        emails.push(adminEmail[i].email);
    }
    return emails;
}
