export interface Holiday {
    getFullYear: () => number;
    getMonth: () => number;
    getDate: () => number;
}

export type IsHolidayOn = (date: string) => Promise<boolean>;
