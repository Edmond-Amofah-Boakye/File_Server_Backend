import nodemailer from 'nodemailer';

const sendFile = (email, message, filename, filePath)  =>{

    const transport = nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_NAME,
          pass: process.env.SENDGRID_API,
        },
    })

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "ATTACHMENT FOR FILE REQUEST",
        html: message,
        attachments:[
            {
                filename: filename,
                path: filePath

            }
        ]
    };


    transport.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error)
        }else{
            console.log(`Email sent ${info.response}`);
        }
    })


}

export default sendFile;
