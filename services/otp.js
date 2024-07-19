import nodemailer from 'nodemailer';

export const otp = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: 'mostafa.hafez.de@gmail.com',
            pass: 'eqrpqpzheqqhpxsu',
        },
    });


    const info = await transporter.sendMail({
        from: 'mostafa.hafez.de@gmail.com', // sender address
        to: to || '', // list of receivers
        subject: subject || '', // Subject line
        text: 'Hello world?', // plain text body
        html: html || '<h2>Sequelize</h2>', // html body
    });

    console.log('Message sent: %s', info);

    if(info.accepted.length > 0){
        return true;
    }else{
        return false
    }

};
