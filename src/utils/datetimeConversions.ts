import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

const configuredTimeZone = 'Pacific/Honolulu';

dayjs.extend(utc)
dayjs.extend(timezone);

//Takes an ISO 8601 date string and converts it to a readable date string
export const toReadableDateTime = (date: string) => {
    let readableTime = dayjs(date).tz(configuredTimeZone).format('MM/DD/YYYY HH:mm:ss');
    return readableTime;
}

// Takes a date string that comes from toReadableDateTime function and converts to a Date object
export const toDateObj = (dateString: string): Date => {
    return dayjs(dateString, 'MM/DD/YYYY HH:mm:ss').toDate();
}

export const getStartOfTomorrow = () => {
    return dayjs().tz(configuredTimeZone).startOf('day').add(1, 'day');
}

export const toUtc = (date: Dayjs): Dayjs => {
    return date.utc();
}