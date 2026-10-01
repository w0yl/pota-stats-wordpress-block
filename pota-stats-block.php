<?php
/**
 * Plugin Name: POTA Stats Block
 * Plugin URI:  https://github.com/w0yl/pota-stats-wordpress-block
 * Description: Gutenberg block displaying POTA user activations and hunted stats in a sortable table.
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:      SCARC
 * License:     GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

function pota_stats_register_no_build_block() {
    $logo_url = plugins_url('assets/pota-logo.png', __FILE__);

    // Register Editor Script
    wp_register_script(
        'pota-stats-editor-js',
        plugins_url('assets/block.js', __FILE__),
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
        '1.0.0'
    );

    // Register Front-end View Script
    wp_register_script(
        'pota-stats-view-js',
        plugins_url('assets/view.js', __FILE__),
        array(),
        '1.0.0',
        true
    );

    // Register Styles
    wp_register_style(
        'pota-stats-style-css',
        plugins_url('assets/style.css', __FILE__),
        array(),
        '1.0.0'
    );

    // Pass the local logo URL to JavaScript
    wp_localize_script('pota-stats-editor-js', 'potaBlockData', array('logoUrl' => $logo_url));
    wp_localize_script('pota-stats-view-js', 'potaBlockData', array('logoUrl' => $logo_url));

    // Register Gutenberg Block
    register_block_type('pota-stats/stats-block', array(
        'editor_script'   => 'pota-stats-editor-js',
        'script'          => 'pota-stats-view-js',
        'style'           => 'pota-stats-style-css',
        'attributes'      => array(
            'callsigns' => array(
                'type'    => 'array',
                'default' => array(),
            ),
            'cacheDuration' => array(
                'type'    => 'number',
                'default' => 1,
            ),
        ),
        'render_callback' => 'pota_stats_render_block_html',
    ));
}
add_action('init', 'pota_stats_register_no_build_block');

// Render callback for front-end output
function pota_stats_render_block_html($attributes) {
    $callsigns_json = esc_attr(json_encode($attributes['callsigns']));
    $cache_duration = esc_attr($attributes['cacheDuration']);

    return sprintf(
        '<div class="pota-dashboard-block" data-callsigns="%s" data-cache-duration="%s">
            <div class="pota-loading">Loading POTA Statistics...</div>
        </div>',
        $callsigns_json,
        $cache_duration
    );
}