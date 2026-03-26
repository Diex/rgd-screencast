<script lang="ts">
	let canvas = $state<HTMLCanvasElement | null>(null);

	const MAX_SKIP_FRAMES = 8;
	const MAX_ITERATIONS_SAME_CELLS = 20;
	const MAX_ITERATIONS_ADD_GARBAGE = 5;

	$effect(() => {
		if (!canvas) return;
		return startGameOfLife(canvas);
	});

	function startGameOfLife(el: HTMLCanvasElement): () => void {
		const ctx = el.getContext('2d')!;
		const supportBlur = 'filter' in CanvasRenderingContext2D.prototype;

		let totalRows = 0;
		let totalColumns = 0;
		let blockWidth = 0;
		let blockHeight = 0;
		let cells: boolean[][] = [];
		let skipFrames = MAX_SKIP_FRAMES;
		let countActiveCells = 0;
		let prevCountActiveCells = 0;
		let sameCountActiveCellsLoop = 0;
		let garbageCount = 0;
		let rafId = 0;

		function resizeCanvas() {
			el.width = window.innerWidth;
			el.height = el.parentElement?.offsetHeight ?? window.innerHeight;
			if (window.innerWidth < 768) {
				totalColumns = 12;
			} else if (window.innerWidth < 1024) {
				totalColumns = 18;
			} else {
				totalColumns = 24;
			}
			blockWidth = el.width / totalColumns;
			blockHeight = blockWidth;
			totalRows = Math.floor(el.height / blockHeight) + 1;
		}

		function paintGlider(i: number, j: number) {
			cells[i + 0][j + 0] = false;
			cells[i + 0][j + 1] = true;
			cells[i + 0][j + 2] = false;
			cells[i + 1][j + 0] = false;
			cells[i + 1][j + 1] = false;
			cells[i + 1][j + 2] = true;
			cells[i + 2][j + 0] = true;
			cells[i + 2][j + 1] = true;
			cells[i + 2][j + 2] = true;
		}

		function initCells(random = false) {
			cells = [];
			for (let i = 0; i < 48; i++) {
				cells[i] = [];
				for (let j = 0; j < 32; j++) {
					cells[i][j] = random ? Math.random() > 0.8 : false;
				}
			}
			if (!random) {
				paintGlider(0, 0);
				paintGlider(0, 5);
				paintGlider(0, 10);
				paintGlider(0, 15);
			}
		}

		function getNeighbors(row: number, col: number): boolean[] {
			const result: boolean[] = [];
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (i === 0 && j === 0) continue;
					let r = row + i;
					let c = col + j;
					if (r < 0) r = totalRows - 1;
					if (r >= totalRows) r = 0;
					if (c < 0) c = totalColumns - 1;
					if (c >= totalColumns) c = 0;
					result.push(cells[r]?.[c] ?? false);
				}
			}
			return result;
		}

		function loopLife() {
			const next: boolean[][] = cells.map((row) => [...row]);
			for (let row = 0; row < totalRows; row++) {
				for (let col = 0; col < totalColumns; col++) {
					const alive = getNeighbors(row, col).filter(Boolean).length;
					if (cells[row]?.[col]) {
						next[row][col] = alive >= 2 && alive <= 3;
					} else {
						next[row][col] = alive === 3;
					}
				}
			}
			cells = next;
			countActiveCells = cells.reduce((sum, row) => sum + row.filter(Boolean).length, 0);

			if (countActiveCells === prevCountActiveCells) {
				sameCountActiveCellsLoop++;
				if (sameCountActiveCellsLoop > MAX_ITERATIONS_SAME_CELLS) {
					initCells(true);
					prevCountActiveCells = 0;
					sameCountActiveCellsLoop = 0;
				}
			}

			garbageCount++;
			if (garbageCount > MAX_ITERATIONS_ADD_GARBAGE) {
				garbageCount = 0;
				for (let i = 0; i < 6; i++) {
					const r = Math.floor(Math.random() * totalRows);
					const c = Math.floor(Math.random() * totalColumns);
					if (cells[r]) cells[r][c] = true;
				}
			}
			prevCountActiveCells = countActiveCells;
		}

		function drawBlock(row: number, col: number, blurType: 0 | 1 | 2) {
			if (supportBlur) {
				if (blurType === 2) {
					ctx.lineWidth = 12;
					ctx.filter = 'blur(12px)';
				} else if (blurType === 1) {
					ctx.lineWidth = 3;
					ctx.filter = 'blur(3px)';
				} else {
					ctx.lineWidth = 1;
					ctx.filter = 'none';
				}
			} else {
				ctx.lineWidth = 1;
			}
			ctx.strokeStyle = 'white';
			ctx.rect(col * blockWidth, row * blockHeight, blockWidth, blockHeight);
		}

		function updateCanvas() {
			ctx.globalAlpha = supportBlur ? 0.05 : 0.3;
			for (const blurType of [2, 1, 0] as const) {
				ctx.beginPath();
				for (let row = 0; row < totalRows; row++) {
					for (let col = 0; col < totalColumns; col++) {
						if (cells[row]?.[col]) drawBlock(row, col, blurType);
					}
				}
				ctx.stroke();
			}
		}

		function animate() {
			if (skipFrames > 0) {
				skipFrames--;
			} else {
				skipFrames = MAX_SKIP_FRAMES;
				ctx.clearRect(0, 0, el.width, el.height);
				loopLife();
				updateCanvas();
			}
			rafId = requestAnimationFrame(animate);
		}

		function onResize() {
			initCells(true);
			resizeCanvas();
			updateCanvas();
		}

		resizeCanvas();
		initCells(false);
		updateCanvas();
		rafId = requestAnimationFrame(animate);
		window.addEventListener('resize', onResize);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', onResize);
		};
	}
</script>

<section
	class="relative overflow-hidden text-center"
	style="min-height:60vh;display:flex;align-items:center;justify-content:center;"
>
	<canvas bind:this={canvas} class="absolute inset-0 h-full w-full" aria-hidden="true"></canvas>
	<div class="relative z-10 mx-auto max-w-4xl space-y-6 px-4 py-20">
		<h1 class="font-mono font-bold drop-shadow-lg leading-tight">
			<span class="block text-4xl md:text-6xl text-white">&gt;Retro_</span>
			<span class="block text-5xl md:text-7xl text-white">GameDev 2026</span>
		</h1>
		<p class="text-xl md:text-2xl" style="color:rgba(255,255,255,0.7);">
			Vote for the new classic. No downloads, no installs. Sign in to cast your vote.
		</p>
		<div class="flex justify-center gap-4">
			<a
				href="/games"
				class="btn btn-lg"
				style="background-color:#30335f;color:white;border:1px solid rgba(48,51,95,0.5);"
			>Browse Games</a>
		</div>
	</div>
</section>
