import memoizeOne from "memoize-one";

export enum NumberFormat {
    language = "language",
    system = "system",
    comma_decimal = "comma_decimal",
    decimal_comma = "decimal_comma",
    space_comma = "space_comma",
    none = "none",
}

export enum TimeFormat {
    language = "language",
    system = "system",
    am_pm = "12",
    twenty_four = "24",
}

export interface FrontendLocaleData {
    language: string;
    number_format: NumberFormat;
    time_format: TimeFormat;
}

const useAmPm = memoizeOne((locale: FrontendLocaleData): boolean => {
    if (
        locale.time_format === TimeFormat.language ||
        locale.time_format === TimeFormat.system
    ) {
        const testLanguage =
        locale.time_format === TimeFormat.language ? locale.language : undefined;
        const test = new Date().toLocaleString(testLanguage);
        return test.includes("AM") || test.includes("PM");
    }

    return locale.time_format === TimeFormat.am_pm;
});

export const formatDateTime = (dateObj: Date, locale: FrontendLocaleData) =>
    formatDateTimeMem(locale).format(dateObj);

const formatDateTimeMem = memoizeOne(
    (locale: FrontendLocaleData) =>
        new Intl.DateTimeFormat(
            locale.language === "en" && !useAmPm(locale)
                ? "en-u-hc-h23"
                : locale.language,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: useAmPm(locale) ? "numeric" : "2-digit",
                minute: "2-digit",
                hour12: useAmPm(locale),
                second: "2-digit"
            }
        )
);

export const formatDateTimeWithSeconds = (
    dateObj: Date,
    locale: FrontendLocaleData
) => formatDateTimeWithSecondsMem(locale).format(dateObj);
  
const formatDateTimeWithSecondsMem = memoizeOne(
    (locale: FrontendLocaleData) =>
        new Intl.DateTimeFormat(
            locale.language === "en" && !useAmPm(locale)
                ? "en-u-hc-h23"
                : locale.language,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: useAmPm(locale) ? "numeric" : "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: useAmPm(locale),
            }
        )
);