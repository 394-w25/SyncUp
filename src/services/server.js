const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'samnangnuonsineoun2025@u.northwester.edu',
    pass: 'ILove2EatSoMuch!',
  },
});

app.post('/send-email', (req, res) => {
  const { emails, subject, text } = req.body;

  const mailOptions = {
    from: 'samnangnuonsineoun2025@u.northwester.edu',
    to: emails.join(', '),
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send('Email sent: ' + info.response);
  });
});

app.listen(5174, () => {
  console.log('Server running on http://localhost:5174');
});
