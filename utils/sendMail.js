import nodemailer from 'nodemailer'

class SendMail{
    constructor(email, name, url){
        this.to = email,
        this.name = name,
        this.url = url
        this.from = process.env.EMAIL
    }

    createTransport(){
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL,
              pass: process.env.USER_PASSWORD,
            },
        })
    }

    async send(subject, message, file, filename){
        const mailOptions = {
            from: process.env.EMAIL,
            to: this.to,
            subject,
            html: message,
        };

        await this.createTransport().sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error)
            }else{
                console.log(`Email sent ${info.response}`);
            }
        })
    }



    async verifyEmail(){
        const message =  `
            <center>
              <h1><strong>Welcome ${this.name}</strong></h1>
              <p style="font-size: 1rem;">
                To complete your registeration, kindly click
                on the link below to Verify your Account!!
              </p>
              <a href=${this.url}>
                <button
                style="
                  color: white;
                  background-color: blue;
                  padding: 0.8rem 4rem;
                  cursor: pointer;
                  border: none;
                  font-size: 1rem;
                "
              >VERIFY</button></a>
            </center>
        `
        await this.send("Email Verification", message)
      }



      async resetpassword(){
        const message =  `
            <center>
              <h1>You have requested for Password Reset</h1>
              <p style="font-size: 1rem;">
                Kindly click on the link below to Reset your password!!
                Link expires in 10 minutes time.
              </p>
              <a href=${this.url}>
                <button
                style="
                  color: white;
                  background-color: red;
                  padding: 0.8rem 4rem;
                  cursor: pointer;
                  border: none;
                  font-size: 1rem;
                "
              >RESET</button></a>
            </center>
        `
        await this.send("Password Verification", message)
      }

}

export default SendMail;