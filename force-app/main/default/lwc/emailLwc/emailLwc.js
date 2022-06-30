/* eslint-disable no-alert */
import { LightningElement, track,api } from "lwc";
import sendEmailController from "@salesforce/apex/EmailClass.sendEmailController";
import { CloseActionScreenEvent } from 'lightning/actions';
import getEmailTemplate from "@salesforce/apex/EmailClass.getEmailTemplate";


export default class EmailLwc extends LightningElement {
    @api recordId;
    toAddress = [];
    ccAddress = [];
    emailTemplate = [] ;
    subject = "";
    body = "";
    @track files = [];

    wantToUploadFile = false;
    noEmailError = false;
    invalidEmails = false;

    toggleFileUpload() {
        this.wantToUploadFile = !this.wantToUploadFile;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.files = [...this.files, ...uploadedFiles];
        this.wantToUploadFile = false;
    }

    handleRemove(event) {
        const index = event.target.dataset.index;
        this.files.splice(index, 1);
    }

    handleToAddressChange(event) {
        this.toAddress = event.detail.selectedValues;
    }

    handleCcAddressChange(event) {
        this.ccAddress = event.detail.selectedValues;
    }
    handleTemplateChange(event) {

        this.emailTemplate = event.detail.selectedValues;
        if(this.emailTemplate.length <=0)
            return;
        getEmailTemplate({ developerName: this.emailTemplate[0],recordId:this.recordId })
            .then((result) => {
                console.log(result)
                this.subject = result.subject;
                this.body = result.body.replaceAll("\r\n","<br/>");
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    handleSubjectChange(event) {
        this.subject = event.target.value;

    }

    handleBodyChange(event) {
        this.body = event.target.value;
        console.log(this.body)
    }

    validateEmails(emailAddressList) {
        let areEmailsValid;
        if(emailAddressList.length > 1) {
            areEmailsValid = emailAddressList.reduce((accumulator, next) => {
                const isValid = this.validateEmail(next);
                console.log(accumulator);
                return accumulator && isValid;
            });
        }
        else if(emailAddressList.length > 0) {
            areEmailsValid = this.validateEmail(emailAddressList[0]);
        }
        return areEmailsValid;
    }

    validateEmail(email) {
        console.log("In VE");
        const res = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        console.log("res", email);
        console.log(res.test(String(email).toLowerCase()))
        return res.test(String(email).toLowerCase());
    }

    handleReset() {
        this.toAddress = [];
        this.ccAddress = [];
        this.emailTemplate = [];
        this.subject = "";
        this.body = "";
        this.files = [];
        this.template.querySelectorAll("c-email-input").forEach((input) => input.reset());
    }

    handleSendEmail() {
        this.noEmailError = false;
        this.invalidEmails = false;
        if (![...this.toAddress, ...this.ccAddress].length > 0) {
            this.noEmailError = true;
            return;
        }
        
        if (!this.validateEmails([...this.toAddress, ...this.ccAddress])) {
            this.invalidEmails = true;
            return;
        }

        let emailDetails = {
            toAddress: this.toAddress,
            ccAddress: this.ccAddress,
            subject: this.subject,
            body: this.body,
            recordId:this.recordId
        };

        sendEmailController({ emailDetailStr: JSON.stringify(emailDetails) })
            .then(() => {
                console.log("Email Sent");
                this.dispatchEvent(new CloseActionScreenEvent());

            })
            .catch((error) => {
                console.error("Error in sendEmailController:", error);
            });
    }
}