import { LightningElement,track,api,wire } from 'lwc';
import { getRecord, getFieldValue, getRecordNotifyChange } from 'lightning/uiRecordApi';
import getAcutelTime from '@salesforce/apex/LC001_Case_Timer.getAcutelTime';
import OWNER_FIELD from '@salesforce/schema/Case.OwnerId';
import case_orange_max from '@salesforce/label/c.case_orange_max';
import case_orange_min from '@salesforce/label/c.case_orange_min';
import case_rouge_max from '@salesforce/label/c.case_rouge_max';
import case_rouge_min from '@salesforce/label/c.case_rouge_min';
import case_vert from '@salesforce/label/c.case_vert';

export default class LC001_case_timer extends LightningElement {
    @api recordId;
    @api nom_de_Timer;
    @track timer = "00:00:00";
    @track formattedTime; 
    @track playing = false;
    @track recording = false;
    timeIntervalInstance;
    clocktimer;
    totalMilliseconds = 0;
    @track ispaused;
    @track tabisclosed;
    @wire(getRecord, { recordId: '$recordId', fields: [OWNER_FIELD] })
    case;
    get owner() {
        return getFieldValue(this.case.data, OWNER_FIELD);
    }
    connectedCallback(){
       this.getAcutelTime();
    }
   
    async getAcutelTime(){
        var time = await getAcutelTime({recordId : this.recordId,timer_name : this.nom_de_Timer});
        
        if(time < 0){
            this.totalMilliseconds =  Math.floor(Math.abs(time + 1));
            this.updateStatus();
            this.changeColor();
        }else{
            this.totalMilliseconds =  Math.floor(time);
            this.start();
        }
        
    }
    updateRecordView() {
        setTimeout(() => {
             eval("$A.get('e.force:refreshView').fire();");
        }, 1000); 
     }
    /////////////////HELPER METHODS//////////////////
    start(){
        let that = this;
        this.playing = true;
        this.recording = true;
        this.clocktimer = setInterval(function(){
            that.updateStatus();
            that.totalMilliseconds += 100;
            that.changeColor();
        }, 100);
    }

    changeColor(){
        var tempsEcoule = this.totalMilliseconds / 3600000;
       
            if( tempsEcoule < case_vert )
                this.template.querySelector('.timerClass').style.color = "#1DAB0A"
            else if(tempsEcoule >= case_orange_min && tempsEcoule < case_orange_max)
                this.template.querySelector('.timerClass').style.color = "#ff8b00"
            else if(tempsEcoule >= case_rouge_min && tempsEcoule < case_rouge_max)
                this.template.querySelector('.timerClass').style.color = "red"
            else
                this.template.querySelector('.timerClass').style.color = "black"
        
    }

    updateStatus(){   
        this.timer = this.formatMilliseconds(this.totalMilliseconds);  
    }    

    //stopwatch stores values as milliseconds
    formatMilliseconds(milliseconds){
        var j,h, m, s = 0;
        j = Math.floor( milliseconds / (24 * 60 * 60 * 1000) );
        milliseconds = milliseconds %  (24 * 60 * 60 * 1000);
        h = Math.floor( milliseconds / (60 * 60 * 1000) );
        milliseconds = milliseconds % (60 * 60 * 1000);
        m = Math.floor( milliseconds / (60 * 1000) );
        milliseconds = milliseconds % (60 * 1000);
        s = Math.floor( milliseconds / 1000 );
        
        return this.pad(j, 2) + ':' +this.pad(h, 2) + ':' + this.pad(m, 2) + ':' + this.pad(s, 2);
    }

    //roll up summary field returns seconds
    formatSeconds(seconds){   
        var h, m, s = 0;
        
        h = Math.floor( seconds / (60 * 60 ) );
        seconds = seconds % (60 * 60 );
        m = Math.floor( seconds / (60 ) );
        seconds = seconds % (60 );
        s = Math.floor( seconds );
        
        return this.pad(h, 2) + ':' + this.pad(m, 2) + ':' + this.pad(s, 2);
    }

    pad(num, size){
        var s = "0000" + num;
        return s.substr(s.length - size);
    }
}