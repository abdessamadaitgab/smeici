public with sharing class LC001_Case_Timer {

  public static Timer__mdt getTimerMetadata(string timer_name){
      return [SELECT Object_Api_name__c, start_date_field__c,end_date_field__c,BusinessHoursName__c FROM Timer__mdt WHERE DeveloperName =: timer_name];
  }

  @AuraEnabled
   public static Decimal getAcutelTime(String recordId,string timer_name){
      Timer__mdt timerMdt = getTimerMetadata(timer_name);
      BusinessHours defaultBH = [SELECT Id FROM BusinessHours WHERE name =:timerMdt.BusinessHoursName__c Limit 1];

      String query = 'SELECT '+timerMdt.start_date_field__c+','+timerMdt.end_date_field__c;
      query += ' FROM '+timerMdt.Object_Api_name__c;
      query += ' WHERE id = \''+recordId+'\'';

      SObject objectTimer = Database.query(query);
      Datetime dateTimeStart = (Datetime) objectTimer.get(timerMdt.start_date_field__c);
      Datetime dateTimeEnd = (Datetime) objectTimer.get(timerMdt.end_date_field__c);

    
      if(dateTimeEnd != null){
        String param = dateTimeStart.format()+';'+dateTimeEnd.format()+';'+defaultBH.id;    
        List<Decimal> delais = AX01_TempsEcoule.calculeDelaiDeCloture(new list<String>{param});
        System.debug(delais);
        return (delais.get(0) * 3600000 * -1) - 1;
      }
        
      else{
        String param = dateTimeStart.format()+';'+Datetime.now().format()+';'+defaultBH.id;    
        List<Decimal> delais = AX01_TempsEcoule.calculeDelaiDeCloture(new list<String>{param});
        return delais.get(0) * 3600000;      

      }
   }
   
}