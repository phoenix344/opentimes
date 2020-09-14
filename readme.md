# OpeningHours

A plain typescript/ES6+ opening hours library with no external dependencies.

## Features

- [x] Support after midnight hours (i.e. 22:00 - 03:00)
- [x] Intl.DateTimeFormat support (for timezone and internationalization)
- [x] Starting the week on any day (default: Sunday)
- [x] Merge overlapping times for maintainance
- [ ] Cut a timespan out of the opening hours (i.e. business hours between 8 AM till 6 PM, pause between 12 and 1 PM)
- [ ] Add onetime events where business is closed or has different opening hours
- [ ] Add yearly recurring events where business is closed or has different opening hours

## Examples

Initialize your class:
```typescript
import { OpeningHours, WeekDays } from '@myscope/opening-hours';

const oh = new OpeningHours({
    currentDate: new Date(2020, 8, 15),
    text: {
        weekDays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        closed: 'geschlossen',
        timespanSeparator: ' bis '
    }
});
```

Insert opening hours entries:
```typescript
oh.add(WeekDays.Monday, '08:00', '12:30');
oh.add(WeekDays.Monday, '13:00', '16:00');

oh.add(WeekDays.Tuesday, '08:00', '12:30');
oh.add(WeekDays.Tuesday, '13:00', '16:00');

oh.add(WeekDays.Wednesday, '08:00', '14:00');

oh.add(WeekDays.Thursday, '08:00', '12:30');
oh.add(WeekDays.Thursday, '13:00', '16:00');

oh.add(WeekDays.Friday, '08:00', '12:30');
oh.add(WeekDays.Friday, '13:00', '16:00');

oh.add(WeekDays.Saturday, '10:00', '14:00');
```

Alternatively you can add a saved JSON output from `toJSON()`:
```typescript
oh.load([
    { "day": 1, "from": "0800", "until": "1230" },
    { "day": 1, "from": "1300", "until": "1600" },
    { "day": 2, "from": "0800", "until": "1230" },
    { "day": 2, "from": "1300", "until": "1600" },
    { "day": 3, "from": "0800", "until": "1400" },
    { "day": 4, "from": "0800", "until": "1230" },
    { "day": 4, "from": "1300", "until": "1600" },
    { "day": 5, "from": "0800", "until": "1230" },
    { "day": 5, "from": "1300", "until": "1600" },
    { "day": 6, "from": "1000", "until": "1400" }
]);
```

To display it as plain text use the `toString()` method:
```typescript
oh.toString();
```

The current day will be highlighted in brackets `[...]`
```
Mo 08:00 bis 12:30, 13:00 bis 16:00
[Di 08:00 bis 12:30, 13:00 bis 16:00]
Mi 08:00 bis 14:00
Do 08:00 bis 12:30, 13:00 bis 16:00
Fr 08:00 bis 12:30, 13:00 bis 16:00
Sa 10:00 bis 14:00
```

To use the data to customize your UI you can also use the `toLocaleJSON` method:
```typescript
oh.toLocaleJSON();
```

The output looks like this (the current day is `active: true`):
```json
[
    {
        "active": false,
        "day": "Mo",
        "times": [
            { "from": "08:30", "until": "12:30" },
            { "from": "13:00", "until": "16:00" }
        ]
    },
    {
        "active": true,
        "day": "Di",
        "times": [
            { "from": "08:30", "until": "12:30" },
            { "from": "13:00", "until": "16:00" }
        ]
    },
    {
        "active": false,
        "day": "Mi",
        "times": [
            { "from": "08:30", "until": "14:00" },
        ]
    },
    {
        "active": false,
        "day": "Do",
        "times": [
            { "from": "08:30", "until": "12:30" },
            { "from": "13:00", "until": "16:00" }
        ]
    },
    {
        "active": false,
        "day": "Fr",
        "times": [
            { "from": "08:30", "until": "12:30" },
            { "from": "13:00", "until": "16:00" }
        ]
    },
    {
        "active": false,
        "day": "Sa",
        "times": [
            { "from": "10:00", "until": "14:00" }
        ]
    },
]
```

To export and save the opening hours, use the `toJSON` method:
```typescript
oh.toJSON();
```

```json
[
    { "day": 1, "from": "0800", "until": "1230" },
    { "day": 1, "from": "1300", "until": "1600" },
    { "day": 2, "from": "0800", "until": "1230" },
    { "day": 2, "from": "1300", "until": "1600" },
    { "day": 3, "from": "0800", "until": "1400" },
    { "day": 4, "from": "0800", "until": "1230" },
    { "day": 4, "from": "1300", "until": "1600" },
    { "day": 5, "from": "0800", "until": "1230" },
    { "day": 5, "from": "1300", "until": "1600" },
    { "day": 6, "from": "1000", "until": "1400" }
]
```

### Different language formats:

```typescript
oh.toString({ locales: 'zh-CN' });
```

The output looks like this:
```
[tue 上午08:00 - 下午12:30, 下午01:00 - 下午04:00]
wed 上午08:00 - 下午02:00
thu 上午08:00 - 下午12:30, 下午01:00 - 下午04:00
fri 上午08:00 - 下午12:30, 下午01:00 - 下午04:00
sat 上午10:00 - 下午02:00
sun closed
mon 上午08:00 - 下午12:30, 下午01:00 - 下午04:00
```

# Documentation

## OpeningHoursOptions

Interface for every available class option.

Property | Default | Description
-------- | ------- | -----------
`weekStart` | `WeekDays.Monday` | The start of the week can vary in different countries. The default is sunday, but you can set it to any week day.
`currentDate` | `new Date()` | This is the indicator to highlight the opening hours of the current day.
`currentDayOnTop` | `false` | Orders the output list, so the current day is always on top.
`locales` | `"de-DE"` | <p>The language tag that represents how the time will be formatted.</p><p>**In case of internationalization it should be defined by the client (i.e. from `navigator.language`**</p>
`dateTimeFormatOptions` | `{ timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }` | <p>The [DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat) configures the time at GMT-2 and only displays hours and minutes in  2-digit format.</p><p>**Should be defined by the business owner to avoid confusion with local and remote timezones.**</p>
`text` | `OpeningHoursTranslation` | An object of translations for display behavior

## OpeningHoursTranslation

Interface for the output text. In case of internationalization you can add your translations here

Property | Default | Description
-------- | ------- | -----------
`weekDays` | `["sun", "mon", "tue", "wed", "thu", "fri", "sat"]` | The human readable week days ordered by 0 = Sunday until 6 = Saturday. This will be used in the `toString()` and `toLocaleJSON()` output.
`timespanSeparator` | `" - "` | Fills the space between the `from` and `until` time in the `toString()` method.
`closed` | `"closed"` | Fills the empty value of a day with the closed message in `toString()` method.

## OpeningHours

Method | Parameters | Return | Description
------ | ---------- | ------ | -----------
`constructor` | (optional) `options?: OpeningHoursOptions` || Initializes the class instance
`add` | `day: WeekDays`<br>`from: string | number | Date`<br>`until: string | number | Date` || <p>Creates a new entry in the OpeningHours object. The interpreter is kind of fuzzy. You can add something like `"0000"` and different interpunctuation like `"12:30"` or `"12.30"` to enter dates.</p><p>It must be in 24hours format. Alternatively you can add a `Date` object, an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime string or a `unix timestamp`.</p>
`load` | `json: Array<{ day: WeekDays, from: string | number | Date, until: string | number | Date }>` || Loads an array of OpeningHours into the class instance
`toString` | (optional) `options?: OpeningHoursOptions` | Example: `"mon 08:00 - 12:30, 13:00 - 16:00"` | Creates a string output that represents the opening hours
`toLocaleJSON` | (optional) `options?: OpeningHoursOptions` | Example: `[{day: string, active: boolean, times: [{day: 1, from: "08:00", until: "12:30"}, {from: "13:00", until: "16:00"}]}]` | Creates an output format that can easily be used to format it in the UI.
`toJSON` || Example: `[{day: 1, from: "0800", until: "1230"}, {day: 1, from: "1300", until: "1600"}]` | Creates an object output for JSON and can be reimported into `load(json)`
