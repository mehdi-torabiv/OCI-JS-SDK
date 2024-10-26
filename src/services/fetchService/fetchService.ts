/**
 * A service for making HTTP requests.
 */
export class FetchService {
	/**
	 * Makes a POST request to the specified URL with the given body.
	 * @param url - The URL to send the request to.
	 * @param body - The request payload.
	 * @returns A promise that resolves to the response data.
	 * @throws Will throw an error if the request fails.
	 */

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	public async post<T>(url: string, body: any): Promise<T> {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorBody = await response.json();
			throw new Error(
				errorBody.errors ? errorBody.errors[0].message : "Failed to fetch data",
			);
		}

		return response.json() as Promise<T>;
	}
}
