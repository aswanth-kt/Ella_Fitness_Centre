function generateOtp() {
  const digit = "1234567890";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digit[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export default generateOtp;