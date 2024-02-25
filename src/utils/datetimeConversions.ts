import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

const configuredTimeZone = 'Pacific/Honolulu';
const readableTimeFormat = 'lll';

dayjs.extend(utc)
dayjs.extend(timezone);

//Takes an ISO 8601 date string and converts it to a local readable date string
export const toReadableDateTime = (date: string) => fromUTC(date).format(readableTimeFormat)

export const fromUTC = (dateString: string): Dayjs => dayjs.utc(dateString).tz(configuredTimeZone);

export const getStartOfDay = (dayOffset: number) => 
    dayjs().tz(configuredTimeZone).startOf('day').add(dayOffset, 'day')

export const getEndOfDay = (dayOffset: number) =>
    dayjs().tz(configuredTimeZone).endOf('day').add(dayOffset, 'day')

export const getStartOfMonth = (monthOffset: number) =>
    dayjs().tz(configuredTimeZone).startOf('month').add(monthOffset, 'month')
    
export const getTodayInSetTz = () => {
    return dayjs().tz(configuredTimeZone);
}

export const toAWSDateTime = (datetime: Dayjs): string => {
    return datetime.utc().format().toString()
}