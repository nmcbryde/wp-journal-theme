<?php get_header(); ?>
<?php get_sidebar(); ?>

	<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
	<div id='content-main'>
		

		<div class="post_full" id="post-<?php the_ID(); ?>">
			
			<h1>~ <?php the_title(); ?> ~</h1>
			<h2 class='header-sub'><?php the_time('l, F jS, Y') ?></h2>
			<?php the_content('<p class="serif">Read the rest of this entry &raquo;</p>'); ?>

			<?php wp_link_pages(array('before' => '<p><strong>Pages:</strong> ', 'after' => '</p>', 'next_or_number' => 'number')); ?>
			<?php the_tags( '<p>Tags: ', ', ', '</p>'); ?>
			
			
			<div class="nav">
				<div class='nav-prev'><?php previous_post_link('&laquo; %link') ?></div>
				<div class='nav-next'><?php next_post_link('%link &raquo;') ?></div>
			</div>
			<p class="postmetadata alt">
				This entry was posted
				<?php /* This is commented, because it requires a little adjusting sometimes.
					You'll need to download this plugin, and follow the instructions:
					http://binarybonsai.com/archives/2004/08/17/time-since-plugin/ */
					/* $entry_datetime = abs(strtotime($post->post_date) - (60*120)); echo time_since($entry_datetime); echo ' ago'; */ ?>
				on <?php the_time('l, F jS, Y') ?> at <?php the_time() ?>
				and is filed under <?php the_category(', ') ?>.
				You can follow any responses to this entry through the <?php comments_rss_link('RSS 2.0'); ?> feed.

				<?php if (('open' == $post-> comment_status) && ('open' == $post->ping_status)) {
					// Both Comments and Pings are open ?>
					You can <a href="#respond">leave a response</a>, or <a href="<?php trackback_url(); ?>" rel="trackback">trackback</a> from your own site.
				<?php } elseif (!('open' == $post-> comment_status) && ('open' == $post->ping_status)) {
					// Only Pings are Open ?>
					Responses are currently closed, but you can <a href="<?php trackback_url(); ?> " rel="trackback">trackback</a> from your own site.
				<?php } elseif (('open' == $post-> comment_status) && !('open' == $post->ping_status)) {
					// Comments are open, Pings are not ?>
					You can skip to the end and leave a response. Pinging is currently not allowed.
				<?php } elseif (!('open' == $post-> comment_status) && !('open' == $post->ping_status)) {
					// Neither Comments, nor Pings are open ?>
					Both comments and pings are currently closed.
				<?php } edit_post_link('Edit this entry.','',''); ?>
			</p>

	<?php comments_template(); ?>
		
	<?php endwhile; else: ?>

		<p>Sorry, no posts matched your criteria.</p>

<?php endif; ?>
		</div>
<?php get_footer(); ?>
