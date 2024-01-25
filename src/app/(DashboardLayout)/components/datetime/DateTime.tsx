import { toReadableDateTime } from "@/utils/datetimeConversions";

const DateTime = ({ value }: { value: string }) => (
    <>
        {toReadableDateTime(value)}
    </>
)

export default DateTime;