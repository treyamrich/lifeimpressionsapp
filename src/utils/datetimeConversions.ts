import moment from "moment-timezone";

//Takes an ISO 8601 date string and converts it to a readable date string
export const toReadableDateTime = (date: string) => {
    //console.log(moment.tz.zonesForCountry('US'));
    let readableTime = moment(date).tz('Pacific/Honolulu').format('MM/DD/YYYY HH:MM:SS');
    return readableTime;
}