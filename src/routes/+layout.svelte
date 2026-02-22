<script lang="ts">
	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen flex-col bg-surface-900 text-surface-50">
	<!-- Header -->
	<AppBar>
		<AppBar.Toolbar>
			<AppBar.Lead>
				<a href="/" class="text-xl font-bold text-primary-500">RGD Screencast</a>
			</AppBar.Lead>
			<AppBar.Trail>
				<nav class="flex gap-4">
					<a href="/" class="hover:text-primary-400 transition-colors">Home</a>
					<a href="/games" class="hover:text-primary-400 transition-colors">Games</a>
				</nav>
			</AppBar.Trail>
		</AppBar.Toolbar>
	</AppBar>

	<!-- Main content -->
	<main class="container mx-auto flex-1 px-4 py-8">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="bg-surface-800 p-4 text-center text-sm text-surface-400">
		<p>&copy; {new Date().getFullYear()} RGD Screencast. Play retro games in your browser.</p>
	</footer>
</div>
