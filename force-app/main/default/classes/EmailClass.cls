public with sharing class EmailClass {
    public static OrgWideEmailAddress owea = [select Id from OrgWideEmailAddress where Address = 'smeia.contact@gmail.com' Limit 1];
   
    @AuraEnabled
    public static TemplateWrapper getEmailTemplate(String developerName,String recordId) {
        EmailTemplate emailTemplate =[SELECT Id,Subject,Description,HtmlValue,DeveloperName,Body 
                FROM EmailTemplate 
                WHERE DeveloperName=: developerName];
        TemplateWrapper templateWrapper = new TemplateWrapper();
        if(emailTemplate != null){

            if(emailTemplate.body?.contains('!Case.'))
                templateWrapper.body = FieldMergeUtil.replaceMergeFieldsWithValues (
                    emailTemplate.body.replaceAll('!Case.','!'), // The string to merge
                    recordId // The record ID
                );
            else
                templateWrapper.body = emailTemplate.body;

            if(emailTemplate.Subject?.contains('!Case.'))
                templateWrapper.subject = FieldMergeUtil.replaceMergeFieldsWithValues (
                    emailTemplate.Subject.replaceAll('!Case.','!'), // The string to merge
                    recordId // The record ID
                );
            else
                templateWrapper.subject = emailTemplate.Subject;
        }
        
        
        return templateWrapper;
    }
    @AuraEnabled
    public static List<SObject> search(String searchString) {
        List<SObject> searchList = new List<SObject>();
        try {
            String searchStr = '*' + searchString + '*';
            String searchquery =
                'FIND\'' +
                searchStr +
                '\'IN ALL FIELDS RETURNING Contact(id, name, email where email != null), User(id, name, email where email != null AND isActive = true) LIMIT 10';
            List<List<SObject>> searchResult = search.query(searchquery);
            for (List<SObject> curList : searchResult) {
                searchList.addAll(curList);
            }
            system.debug('searchList:::' + searchList.size());
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return searchList;
    }

    @AuraEnabled
    public static List<SObject> searchTemplate(String searchString) {
        List<SObject> searchList = new List<SObject>();
        try {
            String searchStr = '*' + searchString + '*';
            String searchquery =
                'FIND\'' +
                searchStr +
                '\'IN ALL FIELDS RETURNING EmailTemplate(id,name, DeveloperName) LIMIT 10';
            List<List<SObject>> searchResult = search.query(searchquery);
            for (List<SObject> curList : searchResult) {
                searchList.addAll(curList);
            }
            system.debug('searchList:::' + searchList.size());
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return searchList;
    }


    @AuraEnabled
    public static void sendEmailController(String emailDetailStr) {
        System.debug(emailTemplate.body);
        EmailWrapper emailDetails = (EmailWrapper) JSON.deserialize(emailDetailStr, EmailWrapper.class);
        Messaging.reserveSingleEmailCapacity(1);
        try {
           
            
            messaging.SingleEmailMessage mail = new messaging.SingleEmailMessage();
            if ( owea != null ) {
                mail.setOrgWideEmailAddressId(owea.Id);
            }
            
            mail.setToAddresses(emailDetails.toAddress);
            mail.setCcAddresses(emailDetails.ccAddress);
            mail.setSubject(emailDetails.subject);
            mail.setHtmlBody(emailDetails.body);
            mail.setEntityAttachments(emailDetails.files);
            Messaging.sendEmail(new List<messaging.SingleEmailMessage>{ mail });
        } catch (exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    Class EmailWrapper {
        public List<String> toAddress;
        public List<String> ccAddress;
        public String subject;
        public String body;
        public List<String> files;
        public String recordId;
    }
    
    Class TemplateWrapper {
        @AuraEnabled
        public String subject;
        @AuraEnabled
        public String body;
    }
}