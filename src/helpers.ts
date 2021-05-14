/**
 * Create a simplified 24h time format without any separator.
 */
export function convertToSimpleFormat(date: Date) {
    const hours = date.getHours().toString();
    const minutes = date.getMinutes().toString();
    const seconds = date.getSeconds().toString();
    return ('00' + hours).slice(hours.length) +
        ('00' + minutes).slice(minutes.length) +
        (seconds !== '0' ?
            ('00' + seconds).slice(seconds.length) : '');
}