const nodemailer = require("nodemailer");

exports.sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "yourgmail@gmail.com",
        pass: "your_app_password"
      }
    });

    const mailOptions = {
      from: email,
      to: "yourgmail@gmail.com",
      subject: "New Contact Message",
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });

  } catch (error) {
    res.status(500).json({ message: "Email failed", error });
  }
};