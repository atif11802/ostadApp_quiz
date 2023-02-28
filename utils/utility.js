exports.sendSms = async (phone, sms) => {
	try {
		const message = `successfully sent sms to ${phone} with otp: ${sms}
        `;
		console.log(message);
	} catch (err) {
		throw new Error(err);
	}
};

exports.sendEmail = async (email, subject, message) => {
	try {
		console.log(`successfully sent email to ${email} with subject: ${subject} and message: ${message}
        `);
	} catch (err) {
		throw new Error(err);
	}
};
