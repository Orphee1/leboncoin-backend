const sgMail = require('@sendgrid/mail')

const sendEmail = async ({ to, subject, html }) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  const msg = {
    from: '"Hugo Lattard" <hugolattard@gmail.com>',
    to,
    subject,
    html,
  }
  // const info = await sgMail.send(msg)
  await sgMail.send(msg)
}

module.exports = sendEmail
