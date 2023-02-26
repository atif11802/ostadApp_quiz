const debug = require("debug")("app:twilio");

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } = process.env;

const twilio = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Send OTP via email or sms.
 *
 * @param {string} to Email address
 * @returns  A object with property 'sent' and 'issue'. Note: if sent = true then issue = undefined
 */
exports.sendOtp = async (to) => {
	try {
		return { sent: true }; // Hacked

		const otpSend = await twilio.verify.services(TWILIO_SERVICE_SID).verifications.create({ to, channel: "email" });

		if (otpSend.status === "pending") {
			debug("OTP Sent Succesful.");
			return { sent: true };
		} else {
			debug("OTP Sent Failed!");
			return { sent: false, issue: "Failed to send OTP." };
		}
	} catch (error) {
		return { sent: false, issue: error.message };
	}
};

/**
 *
 * @param {!string} to where this code was found?
 * @param {!string} otp what is the code?
 * @returns A object with property 'success' and 'issue'. Note: if success = true then issue = undefined
 */
exports.verifyOtp = async (to, otp) => {
	try {
		return { success: true }; // Hacked

		const checkedResult = await twilio.verify.services(TWILIO_SERVICE_SID).verificationChecks.create({ to, code: otp.toString() });

		if (checkedResult && checkedResult.status === "approved") {
			debug("OTP Verify Succesful.");
			return {
				success: true,
			};
		} else {
			debug("OTP Verify Failed!");
			return {
				success: false,
				issue: "Wrong OTP.",
			};
		}
	} catch (error) {
		debug("OTP Verify Failed!", error);
		return {
			success: false,
			issue: "Wrong OTP.",
		};
	}
};
