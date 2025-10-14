import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  MONGODB_URL,
  SITE_NAME,
} from "@/lib/constants/env";
import { sendEmail } from "@/lib/mail/mailer";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { magicLink, twoFactor } from "better-auth/plugins";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { MongoClient } from "mongodb";

const client = new MongoClient(MONGODB_URL);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 0.5,
  },
  emailAndPassword: {
    enabled: true, // Mark this true to use email & password verifications
    autoSignIn: false, // Mark this true for auto sign-in after sign-up
    requireEmailVerification: true, // Mark this true to restrict unverified users this will reduce spam (recommended => true)
    minPasswordLength: 6,
    maxPasswordLength: 128,
    sendResetPassword: async ({
      user,
      url,
      token,
    }: {
      user: { email: string };
      url: string;
      token: string;
    }) => {
      const resetUrl = `${url}?token=${token}`;

      await sendEmail("reset-password", {
        email: user.email,
        subject: "Reset Your Password",
        html: `
              <div style="font-family: Arial, sans-serif; text-align: center;">
                <h2>Password Reset Request</h2>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" 
                  style="display: inline-block; padding: 10px 20px; margin: 20px 0; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                  Reset Password
                </a>
                <p>If you did not request this, please ignore this email.</p>
              </div>
            `,
      });
    },
    resetPasswordTokenExpiresIn: 3600,
    password: {
      hash: async (password: string): Promise<string> => {
        const salt = randomBytes(16).toString("hex"); // 32-char hex
        const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString(
          "hex"
        );
        return `${salt}:${hash}`;
      },

      verify: async ({
        hash,
        password,
      }: {
        hash: string;
        password: string;
      }): Promise<boolean> => {
        const [salt, storedHash] = hash.split(":");
        const derivedHash = pbkdf2Sync(password, salt, 100000, 64, "sha512");

        const storedHashBuffer = Buffer.from(storedHash, "hex");
        return timingSafeEqual(derivedHash, storedHashBuffer);
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail("verify-email", {
        email: user.email,
        url: url,
      });
    },
  },
  // Change User Email Process
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (
        { user, newEmail, url, token },
        request
      ) => {
        await sendEmail("custom", {
          email: user.email,
          subject: "Approve Email Change",
          html: `
                <div style="font-family: Arial, sans-serif; text-align: center;">
                  <h2>Approve Email Change Request</h2>
                  <p>Click the button below to confirm:</p>
                  <a href="${url}" 
                    style="display: inline-block; padding: 10px 20px; margin: 20px 0; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                    I Confirm To Change My Email
                  </a>
                  <p>If you did not request this, please ignore this email.</p>
                </div>
              `,
        });
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        // Perform any cleanup or additional checks here
      },
      sendDeleteAccountVerification: async (
        {
          user, // The user object
          url, // The auto-generated URL for deletion
          token, // The verification token  (can be used to generate custom URL)
        },
        request // The original request object (optional)
      ) => {
        // Your email sending logic here
        await sendEmail("custom", {
          email: user.email,
          subject: "Confirm Your Account Deletion ?",
          html: `
                      <div style="font-family: Arial, sans-serif; text-align: center;">
                        <h2>Confirm Your Account Deletion Request</h2>
                        <p>Click the button below to confirm:</p>
                        <a href="${url}"
                          style="display: inline-block; padding: 7px 14px; margin: 20px 0; color: #fff; background-color: #ff0500; text-decoration: none; border-radius: 5px;font-size:16px;">
                          I Confirm My Account Deletion
                        </a>
                        <p>If you did not request this, please ignore this email.</p>
                      </div>
                    `,
        });
      },
    },
    additionalFields: {
      // This replaced Custom session
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      userType: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
      demo: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  socialProviders: {
    // github: {
    //   clientId: GITHUB_CLIENT_ID,
    //   clientSecret: GITHUB_CLIENT_SECRET,
    // },
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      allowDifferentEmails: true,
    },
  },
  appName: SITE_NAME, // provide your app name. It'll be used as an issuer.
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        // send email to user
        await sendEmail("custom", {
          email: email,
          subject: `Your Magic Link to Login in ${SITE_NAME}`,
          html: `
                  <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                    <h2>Your Magic Link</h2>
                    <p>Use the link below to complete your login process:</p>
                      <a href="${url}" 
                        style="display: inline-block; padding: 10px 20px; margin: 20px 0; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                        Login Using Magic Link
                      </a>
                    <p>This code will expire soon and can only be used once.</p>
                    <p>If you did not attempt to log in, please ignore this email or contact support immediately.</p>
                    <p style="margin-top: 30px; font-size: 12px; color: #777;">Thank you, <br>${SITE_NAME}</p>
                  </div>
                `,
        });
      },
    }),
    nextCookies(),
    twoFactor({
      skipVerificationOnEnable: true,
      otpOptions: {
        async sendOTP({ user, otp }, request) {
          // send otp to user via email
          await sendEmail("custom", {
            email: user.email,
            subject: `Your OTP to Login in ${SITE_NAME}`,
            html: `
                    <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                      <h2>Your One-Time Password (OTP)</h2>
                      <p>Use the code below to complete your login process:</p>
                      <div style="font-size: 24px; font-weight: bold; margin: 20px 0; background-color: #f0f0f0; padding: 15px; display: inline-block; border-radius: 8px;">
                        ${otp}
                      </div>
                      <p>This code will expire soon and can only be used once.</p>
                      <p>If you did not attempt to log in, please ignore this email or contact support immediately.</p>
                      <p style="margin-top: 30px; font-size: 12px; color: #777;">Thank you, <br>${SITE_NAME}</p>
                    </div>
                  `,
          });
        },
      },
    }),
  ], // make sure this is the last plugin in the array
});
