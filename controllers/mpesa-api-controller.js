const axios = require('axios')
const dotenv = require('dotenv')

dotenv.config({ path: '../.env' })

//const Mpesa = require("mpesa-api").Mpesa;

const lipa = async (req, res) => {
    console.log(req.body)
   // const { phone, amount } = req.body
   const amount = 1
   const phone = 254791387442

    const date = new Date()
    const timestamp =
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2)

    const shortCode = process.env.MPESA_PAYBILL
    const passKey = process.env.MPESA_PASSKEY

    const password = new Buffer.from(shortCode + passKey + timestamp).toString("base64")

    await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: shortCode,
            PhoneNumber: phone,
            CallBackURL: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            AccountReference: "Test",
            TransactionDesc: "Test"
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
        .then((result) => {
            console.log(result)
            res.status(200).json(result)
        })
        .catch((error) => {
            console.log(error)
            res.status(400).json(error)
        })
}



//const credentials = {
//    clientKey: 'GnoGX9eReUbKaAN41PMmyNpqchl7cyQu',
//    clientSecret: 'nWghoa9mOBVEgKAi',
//    initiatorPassword: '6908',
//    securityCredential: 'aH7xZ1FYBx76iuXUF4fL57MP1Ww6NS8RlgGYrS6zehfDnz09G8b0HNrH3OVTUaDDUtl4xkMozWGwZ2aIZqFoe8+Qmlh/E8vQZT4cOaK4K0Jvis2rccho9v6WjVHjF61puHpiGXy11Ga5WdearsZBGMn8UwmvHIOD6VFFr5qf3UX/OorTNvEKxaO0b5SJpjIysEX9szbkoMY10Tphiu2RAPmgcmm3/Bv2kyD/+KUgFBfRaLcDXLc/Iz2eZDMAQ0FFPnieZanAJcT8OBnqTZvqANcu0avZ8tRISZGTdTUrfa4eO6/4bVBphrICX0o3BW7rGXhnyFPEM9HKVsAtkPFopw==1',
//    certificatePath: 'keys/example.cert'
//};
//
//const environment = "sandbox";
//
//const mpesa = new Mpesa(credentials, environment);
//
//const lipas = (req, res) => {
//    console.log(req.body)
//    mpesa
//        .lipaNaMpesaOnline({
//            BusinessShortCode: "174379",
//            Amount: 1 /* 1000 is an example amount */,
//            PartyA: "254791387442", //The MSISDN sending the funds
//            PartyB: "174379", //The MSISDN sending the funds
//            PhoneNumber: "254791387442", //The MSISDN sending the funds
//            CallBackURL: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
//            AccountReference: "Account Reference",
//            passKey: "Lipa Na Mpesa Pass Key",
//            TransactionType: "CustomerPayBillOnline" /* OPTIONAL */,
//            TransactionDesc: "Transaction Description" /* OPTIONAL */,
//        })
//        .then((response) => {
//            //Do something with the response
//            //eg
//            console.log(response);
//        })
//        .catch((error) => {
//            //Do something with the error;
//            //eg
//            console.error(error);
//        });
//}

module.exports = { lipa }