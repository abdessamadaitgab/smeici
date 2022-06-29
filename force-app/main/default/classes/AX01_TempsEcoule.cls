public class AX01_TempsEcoule {
    @InvocableMethod(label='Calcule difference Hours')
    public static list<Decimal> calculeDelaiDeCloture(List<string> params){
        List<Decimal> temps = new List<Decimal>();
        for(String param : params){
            List<string> params1 = param.Split(';');
            DateTime date1 =  DateTime.parse(params1.get(0));
            DateTime date2 =  DateTime.parse(params1.get(1));
            Id BussniseHours =  params1.get(2);
            decimal result = BusinessHours.diff(BussniseHours, date1, date2);
            //Result from the method is divided by 60*60*100 (milliseconds to be then converted into hours)
            Decimal resultingHours = result/(60*60*1000);
            //Populating result into our custom field & setting number of decimals
            //decimal TempsEcoule = resultingHours.setScale();
            temps.add(resultingHours);
        }
       
        return temps;
    }
    
}