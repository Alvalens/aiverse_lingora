import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Determines whether the Session has ended.
 *
 * This function calculates the end time of the Session by adding the specified duration
 * (in minutes) to the start time provided. It then compares the end time with the current time.
 *
 * @param startTime - The start time of the Session as a date string acceptable by the Date constructor.
 * @param duration - The duration of the Session in minutes.
 * @returns True if the current time is later than the computed end time, indicating the Session has ended; otherwise, false.
 */
export function isSessionEnded(startTime: Date, duration: number) {
	const start = new Date(startTime).getTime();
	const end = start + duration * 60 * 1000;
	console.log("start", start);
	console.log("end", end);
	console.log("now", Date.now());
	return Date.now() > end;
}

/**
 * Converts a time string to an ISO string with timezone adjustment.
 * This function takes a time string, creates a Date object, and adjusts it
 * to account for the local timezone offset before converting to ISO format.
 *
 * @param time - The time string to be converted
 * @returns The timezone-adjusted time as an ISO string
 */
export function translateTime(time: string) {
	const date = new Date(time);
	const offset = date.getTimezoneOffset();
	date.setMinutes(date.getMinutes() - offset);
	return date.toISOString();
}

/**
 * Formats a language code into its full language name.
 *
 * @param language - The language code to format (e.g., "EN", "ID")
 * @returns The full language name ("English" for "EN", "Indonesian" for "ID", defaults to "English")
 */
export function formatLanguage(language: string) {
	switch (language) {
		case "EN":
			return "English";
		case "ID":
			return "Indonesian";
		default:
			return "English";
	}
}
