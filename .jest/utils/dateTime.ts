import { DateTime, Settings } from 'luxon';

export function freezeNow(): DateTime {
    const now = DateTime.local();
    Settings.now = () =>now.toMillis();

    return now;
}
