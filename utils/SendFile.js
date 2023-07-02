import nodemailer from 'nodemailer';

const sendFile = (email, message, filename, filePath)  =>{

    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL,
              pass: process.env.USER_PASSWORD,
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