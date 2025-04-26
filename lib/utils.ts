import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  const start = new Date(startTime).getTime()
  const end = start + duration * 60 * 1000
  console.log("start", start)
  console.log("end", end)
  console.log("now", Date.now())
  return Date.now() > end
}

export function translateTime(time: string) {
  const date = new Date(time)
  const offset = date.getTimezoneOffset()
  date.setMinutes(date.getMinutes() - offset)
  return date.toISOString()
}

export function formatLanguage(language: string) {
  switch (language) {
    case "EN":
      return "English"
    case "ID":
      return "Indonesian"
    default:
      return "English"
  }
}

export async function validateUrl(urlString: string): Promise<boolean> {
	try {
		const url = new URL(urlString);
		const protocolValid = ["http:", "https:"].includes(url.protocol);
    
		if (!protocolValid) {
			throw new Error("Invalid URL protocol");
		}

    if (url.search) {
      return true;
    }

		// Special handling for YouTube links
		if (
			url.hostname.includes("youtube.com") ||
			url.hostname.includes("youtu.be")
		) {
			const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
				urlString
			)}&format=json`;
			const oembedResponse = await fetch(oembedUrl, { method: "GET" });
			if (!oembedResponse.ok) {
				console.error(
					`YouTube video does not exist or is private: ${urlString}`
				);
				return false;
			}
			return true;
		}

		// For all other URLs, perform basic fetch check
		const response = await fetch(urlString, { method: "GET" });
		if (!response.ok) {
			console.error(
				`Non-YouTube URL fetch failed: ${response.status} ${urlString}`
			);
			return false;
		}
		return true;
	} catch (err) {
		console.error(`Error validating URL: ${urlString}`, err);
		return false;
	}
}