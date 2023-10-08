import moment from "moment-timezone";

//Takes an ISO 8601 date string and converts it to a readable date string
export const toReadableDateTime = (date: string) => {
    //console.log(moment.tz.zonesForCountry('US'));
    let readableTime = moment(date).tz('Pacific/Honolulu').format('MM/DD/YYYY HH:mm:ss');
    return readableTime;
}

// Takes a date string that comes from toReadableDateTime function and converts to a Date object
export const toDateObj = (dateString: string): Date => {
    return moment(dateString, 'MM/DD/YYYY HH:mm:ss').toDate();
}