// export const handledExceptionMagicString = '0x68616e646c6564';

export class ManagedError {
	constructor(public error: unknown) {}
}

export async function timeout(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function markErrorAsHandled(error: unknown) {
	return new ManagedError(error);
}

export function formatDownloadRate(bytePerSecond: number) {
	// it is now bit per second. not changing the name though
	bytePerSecond = bytePerSecond * 8;
	if (bytePerSecond < 1024) {
		return bytePerSecond.toPrecision(3).concat(' bps');
	} else if (bytePerSecond < 1024 * 1024) {
		return (bytePerSecond / 1024).toPrecision(3).concat(' Kbps');
	} else if (bytePerSecond < 1024 * 1024 * 1024) {
		return (bytePerSecond / 1024 / 1024).toPrecision(3).concat(' Mbps');
	} else {
		return (bytePerSecond / 1024 / 1024 / 1024).toPrecision(3).concat(' Gbps');
	}
}
export function toHHMMSS(seconds: number) {
	// let seconds = 9999;
	// multiply by 1000 because Date() requires miliseconds
	const date = new Date(seconds * 1000);
	const hh: string | number = date.getUTCHours();
	const mm: string | number = date.getUTCMinutes();
	const ss: string | number = date.getSeconds();
	return `${hh ? `${hh}h ` : ''}${mm ? `${mm}min ` : ''}${ss}s`;
}
