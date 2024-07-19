import { Mpesa } from "mpesa-api";

const credentials = {
    clientKey: 'YOUR_CONSUMER_KEY_HERE',
    clientSecret: 'YOUR_CONSUMER_SECRET_HERE',
    initiatorPassword: 'YOUR_INITIATOR_PASSWORD_HERE',
    securityCredential: 'YOUR_SECURITY_CREDENTIAL',
    certificatePath: 'keys/example.cert'
};

const environment = "sandbox";

const mpesa = new Mpesa(credentials, environment);

mpesa
  .lipaNaMpesaOnline({
    BusinessShortCode: 123456,
    Amount: 1000 /* 1000 is an example amount */,
    PartyA: "Party A",
    PhoneNumber: "Phone Number",
    CallBackURL: "CallBack URL",
    AccountReference: "Account Reference",
    passKey: "Lipa Na Mpesa Pass Key",
    TransactionType: "Transaction Type" /* OPTIONAL */,
    TransactionDesc: "Transaction Description" /* OPTIONAL */,
  })
  .then((response) => {
    //Do something with the response
    //eg
    console.log(response);
  })
  .catch((error) => {
    //Do something with the error;
    //eg
    console.error(error);
  });