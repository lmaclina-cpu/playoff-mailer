<?php
/**
 * Playoff Mailer — almacén de envíos.
 *
 * Pegar en WordPress con Code Snippets ("Ejecutar en todas partes") y activar.
 * Crea un tipo de contenido privado donde la app guarda los envíos del equipo.
 * No sale en el menú ni en la web: solo se ve a través de la API.
 */
add_action( 'init', function () {
	register_post_type( 'pm_envio', array(
		'label'               => 'Envíos Playoff Mailer',
		'public'              => false,
		'publicly_queryable'  => false,
		'show_ui'             => false,
		'show_in_menu'        => false,
		'exclude_from_search' => true,
		'has_archive'         => false,
		'rewrite'             => false,
		'show_in_rest'        => true,
		'rest_base'           => 'pm_envio',
		'supports'            => array( 'title', 'editor' ),
		'capability_type'     => 'post',
		'map_meta_cap'        => true,
	) );
} );
