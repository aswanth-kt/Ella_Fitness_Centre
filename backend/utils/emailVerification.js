import nodemailer from "nodemailer";
import { gym_full_name, gym_slogan } from "../const/gymData";

const sendNodeMailer = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      family: 4,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    transporter.verify((err, success) => {
      console.log("VERIFY:", err || success);
    });

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Password Reset OTP - Ella's Fitness Center",
      text: `Your OTP is ${otp}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Password Reset OTP</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:30px 0;">
              <tr>
                  <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                          
                          <!-- Header -->
                          <tr>
                              <td align="center" style="background:#111827;padding:30px;">
                                  <h1 style="color:#fbbf24;margin:0;font-size:28px;">
                                      ${gym_full_name}
                                  </h1>
                                  <p style="color:#d1d5db;margin-top:8px;font-size:14px;">
                                      ${gym_slogan}
                                  </p>
                              </td>
                          </tr>

                          <!-- Content -->
                          <tr>
                              <td style="padding:40px 30px;">
                                  <h2 style="color:#111827;margin-top:0;">
                                      Password Reset Request
                                  </h2>

                                  <p style="font-size:16px;color:#4b5563;line-height:1.6;">
                                      We received a request to reset your password.
                                      Use the OTP below to continue the password reset process.
                                  </p>

                                  <!-- OTP Box -->
                                  <div style="text-align:center;margin:35px 0;">
                                      <div style="
                                          display:inline-block;
                                          background:#fbbf24;
                                          color:#111827;
                                          padding:18px 40px;
                                          font-size:32px;
                                          font-weight:bold;
                                          letter-spacing:8px;
                                          border-radius:10px;
                                      ">
                                          ${otp}
                                      </div>
                                  </div>

                                  <p style="font-size:15px;color:#6b7280;line-height:1.6;">
                                      This OTP is valid for <strong>5 minutes</strong>.
                                      Do not share this code with anyone.
                                  </p>

                                  <p style="font-size:15px;color:#6b7280;line-height:1.6;">
                                      If you did not request a password reset, please ignore this email.
                                  </p>
                              </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                              <td align="center" style="background:#111827;padding:20px;">
                                  <p style="margin:0;color:#9ca3af;font-size:13px;">
                                      © ${new Date().getFullYear()} ${gym_full_name}
                                  </p>
                                  <p style="margin-top:8px;color:#9ca3af;font-size:12px;">
                                      Train Hard. Stay Strong. Live Healthy.
                                  </p>
                              </td>
                          </tr>

                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent : ", email);
    // console.log("Email sent info : ", info);
    return true;
  } catch (error) {
    console.error("Error sending email", error);
    return false;
  }
};

export default sendNodeMailer;
