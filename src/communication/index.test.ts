import { assertStrictEquals } from '@std/assert';
import { BasePeerAdapter, type IBasePeer } from './index.ts';

Deno.test('Communicate with IUsefulPeer', () => {
	class BasePeer implements IBasePeer {
		public other?: BasePeer;

		public connect(other: BasePeer) {
			this.other = other;
			other.other = this;
		}

		protected receive(data: string): void {
			this.callbacks.forEach((callback) => callback(data));
		}

		protected callbacks: ((data: string) => void)[] = [];

		send(data: string): void {
			this.other?.receive(data);
		}

		onreceive(callback: (data: string) => void): void {
			this.callbacks.push(callback);
		}
	}

	const bp0 = new BasePeer();
	const bp1 = new BasePeer();
	bp0.connect(bp1);

	const p0 = new BasePeerAdapter(bp0);
	const p1 = new BasePeerAdapter(bp1);

	p0.bind('get_pi', () => '3.1415926535');
	p1.listen('go_get_pi', async () => {
		const PI = await p1.invoke('get_pi');
		assertStrictEquals(PI, '3.1415926535');
	});

	p0.notify('go_get_pi');
});
