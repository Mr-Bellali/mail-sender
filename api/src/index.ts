import express, { Request, Response } from "express"
import cors from 'cors';
import bodyParser from "body-parser";
import nodemailer from "nodemailer"

// Create transporter function
function makeTransporter (email: string, password: string) {
    return nodemailer.createTransport({
        port: 465,
        host: 'smtp.gmail.com',
        auth: {
            user: email,
            pass: password
        },
        secure: true
    })
}

const app = express()
const PORT = 8080;
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
const route = express.Router();

// Route to send an email 
route.post('/mail', (req, res) => {
    const {from, password, to, subject, text, html} = req.body
    const transporter = makeTransporter(from, password)
    const mailData = {
        from,
        to,
        subject,
        text,
        html
    }
    transporter.sendMail(mailData, (error, info) => {
        if(error) {
            res.status(400).send({error})
            return console.log(error)
        }
        if(!to){
            return res.status(400).send({error})
        }
        res.status(200).send({
            message: 'Mail send', 
            message_id: info.messageId
        })
    })
})

app.use('/api/v1', route);
app.listen(PORT, () => { console.log(`Access API on http://localhost:${PORT}/api/v1`) })
export default app