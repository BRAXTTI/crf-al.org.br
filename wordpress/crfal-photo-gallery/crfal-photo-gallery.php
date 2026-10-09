<?php
/**
 * Plugin Name: CRF-AL — API da Galeria de Fotos
 * Description: Integra as galerias publicadas do FooGallery ao portal institucional.
 * Version: 1.0.0
 * Requires PHP: 7.4
 */

defined( 'ABSPATH' ) || exit;

final class CRFAL_Photo_Gallery_API {
    public static function register() {
        register_rest_route( 'crfal/v1', '/photo-albums', array(
            'methods' => 'GET',
            'permission_callback' => '__return_true',
            'callback' => array( __CLASS__, 'listing' ),
            'args' => array(
                'page' => array( 'default' => 1, 'type' => 'integer', 'minimum' => 1 ),
                'per_page' => array( 'default' => 12, 'type' => 'integer', 'minimum' => 1, 'maximum' => 24 ),
            ),
        ) );
        register_rest_route( 'crfal/v1', '/photo-albums/(?P<slug>[a-z0-9-]+)', array(
            'methods' => 'GET',
            'permission_callback' => '__return_true',
            'callback' => array( __CLASS__, 'detail' ),
        ) );
    }

    private static function available() {
        return class_exists( 'FooGallery' ) && method_exists( 'FooGallery', 'get_by_id' );
    }

    private static function unavailable() {
        return new WP_Error( 'crfal_gallery_unavailable', 'A galeria está temporariamente indisponível.', array( 'status' => 503 ) );
    }

    private static function text( $value ) {
        return html_entity_decode( wp_strip_all_tags( (string) $value ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
    }

    private static function photo( $attachment ) {
        $id = isset( $attachment->ID ) ? absint( $attachment->ID ) : 0;
        $post = $id ? get_post( $id ) : null;
        if ( ! $post || 'attachment' !== $post->post_type || ! in_array( $post->post_status, array( 'inherit', 'publish' ), true ) || $post->post_password || ! wp_attachment_is_image( $id ) ) {
            return null;
        }
        $full = wp_get_attachment_image_src( $id, 'full' );
        $thumb = wp_get_attachment_image_src( $id, 'medium_large' );
        if ( ! $full ) {
            return null;
        }
        return array(
            'id' => $id,
            'src' => esc_url_raw( $full[0] ),
            'thumbnail' => esc_url_raw( $thumb ? $thumb[0] : $full[0] ),
            'width' => (int) $full[1],
            'height' => (int) $full[2],
            'alt' => self::text( isset( $attachment->alt ) ? $attachment->alt : '' ),
            'caption' => self::text( isset( $attachment->caption ) ? $attachment->caption : '' ),
        );
    }

    private static function album( $post, $with_photos = false ) {
        $gallery = FooGallery::get_by_id( $post->ID );
        if ( ! $gallery ) {
            return self::unavailable();
        }
        $photos = array();
        // A API PHP aplica a seleção, a ordenação e os filtros do FooGallery.
        // Não usar media?parent=: uma foto reutilizada pode pertencer a outro post.
        foreach ( $gallery->attachments() as $attachment ) {
            $photo = self::photo( $attachment );
            if ( $photo ) {
                $photos[] = $photo;
            }
        }
        $cover = null;
        $featured_id = get_post_thumbnail_id( $post->ID );
        foreach ( $photos as $photo ) {
            if ( $photo['id'] === (int) $featured_id ) {
                $cover = $photo;
                break;
            }
        }
        $album = array(
            'id' => (int) $post->ID,
            'slug' => $post->post_name,
            'title' => self::text( $post->post_title ),
            'description' => self::text( $post->post_excerpt ),
            'date' => get_post_time( 'c', true, $post ),
            'modified' => get_post_modified_time( 'c', true, $post ),
            'count' => count( $photos ),
            'cover' => $cover ?: ( isset( $photos[0] ) ? $photos[0] : null ),
        );
        if ( $with_photos ) {
            $album['photos'] = $photos;
        }
        return $album;
    }

    private static function response( $data ) {
        $response = new WP_REST_Response( $data );
        // Alterações editoriais ficam visíveis após no máximo um minuto de cache.
        $response->header( 'Cache-Control', 'public, max-age=60' );
        return $response;
    }

    public static function listing( $request ) {
        if ( ! self::available() ) {
            return self::unavailable();
        }
        $query = new WP_Query( array(
            'post_type' => 'foogallery',
            'post_status' => 'publish',
            'has_password' => false,
            'posts_per_page' => (int) $request['per_page'],
            'paged' => (int) $request['page'],
            'orderby' => array( 'date' => 'DESC', 'ID' => 'DESC' ),
        ) );
        $albums = array();
        foreach ( $query->posts as $post ) {
            $album = self::album( $post );
            if ( is_wp_error( $album ) ) {
                return $album;
            }
            $albums[] = $album;
        }
        return self::response( array( 'albums' => $albums, 'total' => (int) $query->found_posts, 'totalPages' => (int) $query->max_num_pages ) );
    }

    public static function detail( $request ) {
        if ( ! self::available() ) {
            return self::unavailable();
        }
        $post = get_page_by_path( $request['slug'], OBJECT, 'foogallery' );
        if ( ! $post || 'publish' !== $post->post_status || $post->post_password ) {
            return new WP_Error( 'crfal_album_not_found', 'Álbum não encontrado.', array( 'status' => 404 ) );
        }
        $album = self::album( $post, true );
        return is_wp_error( $album ) ? $album : self::response( $album );
    }
}

add_action( 'rest_api_init', array( 'CRFAL_Photo_Gallery_API', 'register' ) );
