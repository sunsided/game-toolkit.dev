// The one demo running on the page. Each demo is a wasm instance with its own GPU context
// and audio, so starting one stops the other: its iframe goes, and with it all of that.
export const player = $state({ active: null as string | null });
