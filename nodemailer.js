const nodemailer = require("nodemailer")
const googleApis = require("googleapis")

const REDIRECT_URI =`https://developers.google.com/oauthplayground`;
const CLIENT_ID = `789519213563-cq60sges5nkn5fg5h9o33rqjh347golg.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//04iPvRMaxbLxWCgYIARAAGAQSNwF-L9Irjwy5Ko1Kirf6ENfyCQgPkYW7HzDRemsQz5LQHRuzALTPQr3bhI_aPMHDNwsoQUoCq1Y`;

const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET,REDIRECT_URI);
authClient.setCredentials({refresh_token: REFRESH_TOKEN});

async function mailer(receiver,id,key){
    try{
        const ACCESS_TOKEN = await authClient.getAccessToken();
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user:"pvalmadir@gmail.com",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN
            }
        })
        const details = {
            from: "Valmadir Putin<pvalmadir@gmail.com>",
            to: receiver,
            subject: "facebook reset password link",
            text:"kuch to kuch to",
            html: `hey you can recover your account by clicking on the following link <a href="http://localhost:3000/forgot/${id}/${key}">http://localhost:3000/forgot/${id}/${key}</a>`
        }
        const result = await transport.sendMail(details);
        return result;
        
    }
    catch(err){
        return err;
    }
}

module.exports = mailer