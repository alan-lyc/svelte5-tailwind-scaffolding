<!--
	@component
	A ready-to-use modal for you to build custom functions on top of it.
	
	It is supposed to provide a default style, and you are not supposed to build your own style for it.
-->
<script lang="ts">
	import { timeout } from '../util.js';
	import { onMount, type Snippet } from 'svelte';
	import '../common.css';

	let {
		dialog = $bindable(),
		visible = $bindable(),
		duration = 200,
		class: classList,
		// flex = 'horizontal',
		animateClose: closeFn = $bindable(),
		alwaysFullWidth = false,
		buttons,
		children
	}: {
		dialog?: HTMLDialogElement | null | undefined;
		visible?: boolean;
		/**
		 * the duration of animation in `ms` (milliseconds)
		 */
		duration?: number;
		class?: string;
		buttons?: Snippet<[typeof animateClose]>;
		alwaysFullWidth?: boolean;
		/**
		 * Whether or not to apply a *horizontal flex* to the content container
		 * ```txt
		 * *-------------------------------------------*
		 * | ## Your Privacy Matters                   | | <-- this box
		 * | We sell your data to 3rd party to make    | |
		 * | money.                                    | |
		 * *-------------------------------------------*
		 * |                                    [ OK ] |
		 * *-------------------------------------------*
		 * ```
		 */
		flex?: 'horizontal' | 'vertical' | false;
		animateClose?: typeof animateClose;

		// 'class'?: string
		children: Snippet<[typeof animateClose]>;
	} = $props();

	// let transparent = $state(false)

	onMount(async () => {
		closeFn = animateClose;
		if (visible === undefined) {
			dialog?.close();
			await timeout(100);
			dialog?.showModal();
			visible = true;
		}
	});

	/**
	 * ### WARNING: call this before you `resolve`!!!
	 */
	async function animateClose(): Promise<
		({ WARNING: 'call this before you call resolve' } & never) | void
	> {
		visible = false;
		await timeout(duration);
	}
</script>

<!-- svelte-ignore deprecated_slot_element -->
<dialog
	bind:this={dialog}
	class="
		{classList}
		{visible
		? 'scale-[1] backdrop:bg-black/25 dark:backdrop:bg-white/15'
		: 'scale-[0] backdrop:bg-transparent dark:backdrop:bg-transparent'} 
		overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all backdrop:transition-all
		{alwaysFullWidth ? 'w-full' : 'sm:w-full'} sm:max-w-lg min-w-72 flex flex-col
	"
	style="--sc-tr-d: {duration}ms"
>
	<div
		class=" bg-white dark:bg-gray-800 px-4 {buttons ? 'pb-4' : 'pb-6'} pt-5 sm:p-6 sm:pb-4 flex-[1_1_auto] min-h-0 flex flex-col sm:flex-row"
	>
		{@render children(animateClose)}
	</div>
	{#if buttons}
		<div
			class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 sm:px-6"
		>
			{@render buttons(animateClose)}
		</div>
	{/if}
</dialog>

<!-- <dialog bind:this={dialog} class="h-max flex flex-col overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all backdrop:transition-all text-white sm:w-full sm:max-w-lg min-w-72">
	<div class="flex-[1_1_auto] min-h-0 overflow-auto">
		Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nulla, porro illum voluptate repellat laborum repellendus, ab debitis veniam vel perferendis maiores corrupti provident dicta quaerat fugit blanditiis placeat! Ratione, nemo.
		Dicta atque, velit iure vel commodi, voluptate, quidem neque doloribus quis reiciendis voluptas eius incidunt blanditiis. Quia delectus accusamus, quis accusantium nemo quae laudantium ea temporibus aliquam deleniti maiores fuga!
		Adipisci explicabo, quod nesciunt consequatur et, velit ea, tempora dolor quas fugit vel! Sapiente minus odio dolorum natus non atque soluta, illo doloremque vel nemo, tenetur quia incidunt necessitatibus impedit!
		Qui delectus adipisci, voluptatibus nemo atque iusto distinctio esse dolorem, blanditiis quis deleniti minima molestiae culpa reiciendis, nihil voluptatem. Esse repellat cumque repudiandae, illo quaerat inventore non totam eum voluptatem?
		Impedit laudantium corrupti in consequatur tempora sed quos consequuntur quaerat minus officiis, soluta quia quod, assumenda quidem voluptate minima labore ea ex. Ad, perferendis sequi. Eveniet incidunt recusandae enim delectus.
		Ad eveniet enim officiis, at accusantium totam? Explicabo incidunt fugiat aliquid illo soluta repudiandae ipsum tenetur sunt? Repellendus cum amet ducimus, autem placeat quisquam fugiat ipsum repudiandae recusandae ad officia.
		Adipisci, enim. Architecto mollitia labore voluptas similique? Magnam omnis, inventore fugit deserunt incidunt, vero adipisci, totam magni atque placeat iusto quia deleniti tempora voluptatem quibusdam velit ab explicabo reprehenderit fugiat.
		Perspiciatis fuga sint laboriosam incidunt impedit voluptates, totam quas nobis sequi explicabo at dolores error officia cum ab tenetur possimus labore, ex veniam doloremque nisi quos? Laudantium eligendi nihil molestias?
		Expedita distinctio a at, veritatis quos quaerat corrupti quibusdam autem? Laborum illo hic vero eum culpa beatae quis incidunt deserunt voluptas veritatis aliquam, delectus dicta, inventore deleniti minus atque doloremque?
		Magnam neque perferendis et, repellat libero consequuntur aperiam ipsam deleniti voluptatum eius beatae aliquid fugiat atque nostrum sit eaque vero omnis. Dolorem dolore necessitatibus a amet doloribus! Ipsam, accusamus laborum.
		Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum praesentium consectetur eos optio, exercitationem ullam nesciunt earum excepturi corrupti illum veritatis natus, qui ex nisi illo alias quo itaque ipsam.
		Sapiente voluptas ab hic non quibusdam minima iure enim esse, asperiores blanditiis dolorum nam et maxime assumenda id odio modi ad obcaecati perspiciatis possimus at unde deleniti voluptatem illum! Aliquam.
		Adipisci veniam est architecto repellendus totam, ad vero aliquam quis. Mollitia unde aut quis, quasi ut illo nam aspernatur quia ipsam odit voluptatibus obcaecati debitis hic adipisci? Molestiae, quae quis!
		Nemo praesentium molestiae dolor labore amet nisi, a est recusandae facilis reiciendis mollitia autem sequi voluptatum repellat voluptates omnis esse! Voluptatem ratione, porro amet distinctio omnis rem natus vel. Quos.
		Quibusdam, beatae? Molestiae sit maxime dolor, explicabo voluptates, doloribus nesciunt dolorem porro laudantium consequatur accusantium obcaecati. Ducimus beatae autem error omnis pariatur obcaecati nam quo, ipsam veniam necessitatibus. Voluptate, reprehenderit?
		Blanditiis sunt officia suscipit explicabo magnam quidem laborum dolor nisi quis excepturi fuga ea odit, accusantium, possimus natus molestiae asperiores laudantium. Commodi exercitationem laborum est aliquam voluptatem corrupti perferendis quia!
		Ipsam voluptatum quam, fugiat perferendis et officia laborum aliquam id minima saepe modi laboriosam veniam quo, non nulla odio ea beatae quia quasi molestiae sed recusandae. Neque incidunt odit asperiores?
		Amet exercitationem atque neque placeat provident quod laborum deleniti aut iusto itaque. Culpa animi modi, aut alias eligendi libero minima blanditiis fugiat illo, ratione hic? Nihil sit commodi nostrum nulla?
		Enim laborum, dolore voluptas aliquid unde neque incidunt laudantium odio reprehenderit voluptatibus eligendi quos soluta tenetur necessitatibus natus eveniet eum deserunt, vel ab asperiores. Beatae est commodi obcaecati enim accusantium!
		Maiores temporibus, sapiente sunt laudantium hic maxime numquam veniam praesentium velit officia modi, quam sint suscipit quibusdam aut nisi ab! Cumque possimus et eligendi facere nobis voluptatem ratione quod doloremque!
	</div>
	<div class="p-4">
		Buttons
	</div>
</dialog> -->

<style lang="postcss">
	dialog {
		transition-duration: var(--sc-tr-d);
	}
	dialog::backdrop {
		transition-duration: var(--sc-tr-d);
	}
</style>
