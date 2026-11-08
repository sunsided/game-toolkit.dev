import { asset } from '$app/paths';

type Asset = Parameters<typeof asset>[0];

/**
 * The URL of a file a script puts below static/ (`task sources`, `task demos`). asset()'s type
 * only knows the files that were there at check time.
 */
export function generated(path: string): string {
	return asset(path as Asset);
}
