import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

const configuredTimeZone = 'Pacific/Honolulu';
const readableTimeFormat = 'MM/DD/YYYY hh:mm:ss A';

dayjs.extend(utc)
dayjs.extend(timezone);

//Takes an ISO 8601 date string and converts it to a readable date string
export const toReadableDateTime = (date: string) => {
    let readableTime = dayjs(date).tz(configuredTimeZone).format(readableTimeFormat);
    return readableTime;
}

// Takes a date string that comes from toReadableDateTime function and converts to a Dayjs object
export const toTimezoneWithoutAdjustingHours = (dateString: string): Dayjs => {
    const dayjsObj = dayjs(dateString);

    // Save the time info
    const hours = dayjsObj.hour();
    const minutes = dayjsObj.minute();
    const seconds = dayjsObj.second();
    const milliseconds = dayjsObj.millisecond();

    return dayjsObj.tz(configuredTimeZone)
        .set('hour', hours)
        .set('minute', minutes)
        .set('second', seconds)
        .set('millisecond', milliseconds);
}

export const getStartOfTomorrow = () => {
    return dayjs().tz(configuredTimeZone).startOf('day').add(1, 'day');
}

export const toAWSDateTime = (datetime: Dayjs): string => {
    return datetime.utc().format().toString()
}