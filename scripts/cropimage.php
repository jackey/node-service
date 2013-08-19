#!/usr/bin/env php
<?php

############################################################
#                                                          #
# CopyRight http://c3o.asia, Inc                           #
# Author: JackeyChen (jziwenchen@gmail.com)                #
#                                                          #
############################################################

// We must run it as command line mode.
if (php_sapi_name() != 'cli') {
	die();
}

/**
 * Helper function to find out right place to storage thumbnail
 * image.
 * @param $source_file 
 * @param $name 
 * distnation file name prefix. we usually use size (186_186).
 * @return string
 */
function user_media_thumbnial_path($source_file, $name) {
	$base_name = pathinfo($source_file, PATHINFO_BASENAME);
	$dir_name = pathinfo($source_file, PATHINFO_DIRNAME);
	return "{$dir_name}/thumbnail_{$name}_". $base_name;
}

/**
 * Helper function to get thumbnail path from source path
 * @param source_path
 * @return string
 * @author jziwenchen@gmail.com
 */
function load_thumbnail_path($source_path) {
	// Hardcode.
	$name = "186_186";
	$base_name = pathinfo($source_path, PATHINFO_BASENAME);
	$dir_name = pathinfo($source_path, PATHINFO_DIRNAME);
	return "{$dir_name}/thumbnail_{$name}_". $base_name;
}

/**
 * Save thumbnail image of source image.
 * The size is 186 x 186
 * @author jziwenchen@gmail.com
 * @param $source_file 
 * @return boolean
 */
function crop_image($source_file) {
	$file_size = getimagesize($source_file);
	global $width_height;
	$mime = @$file_size["mime"];
	$channel = @$file_size["channels"];
	$bits = @$file_size["bits"];
	$width = $file_size[0];
	$height = $file_size[1];
	$_t = explode("/", $mime);
	$ext_name = $_t[1];
	$dist_w = $width_height[0];
	$dist_h = $width_height[1];

	$func = "imagecreatefrom". strtolower($ext_name);

	if (function_exists($func)) {
		$source_image = $func($source_file);

		// Step 1, Make source image to square with width/height equals as smaller source image width/height
		if ($width > $height) {
			$dist_image = imagecreatetruecolor($height, $height);
			$to_width = $height;
			$to_height = $height;
		}
		else {
			$dist_image = imagecreatetruecolor($width, $width);
			$to_width = $width;
			$to_height = $height;
		}
		imagecopyresampled($dist_image, $source_image, 0, 0, ($width - $to_width)/2, ($height - $to_height)/2, $to_width, $to_height, $to_width, $to_height);

		// Step 2, Make dist image to 186/186 size;
		$dist_image_2 = imagecreatetruecolor($dist_w, $dist_h);
		imagecopyresampled($dist_image_2, $dist_image, 0, 0, 0, 0, $dist_w, $dist_h, $to_width, $to_height);

		// Step 3, Save it.
		$create_func = "image".strtolower($ext_name);
		if (function_exists($create_func)) {
			$create_func($dist_image_2, user_media_thumbnial_path($source_file, $width_height[0] . "_" . $width_height[1]));
		}
		else {
			return false;
		}
	}
	else {
		return false;
	}

	return true;
}

function thumbnail_width_height() {
	global $thumbnail;
	preg_match("/\d+_\d+/i" ,$thumbnail, $matches);
	return explode("_", $matches[0]);
}

// Get media from arguments that passed from command line.
// (Maybe call by nodejs)
define("ROOT", dirname(dirname(__FILE__)));
$media = @$_SERVER["media"];
$thumbnail = @$_SERVER["thumbnail"];
$source_file = ROOT.'/statics/'. $media;
$width_height = thumbnail_width_height();

if (!file_exists($source_file)) {
	return;
}

if (!$thumbnail) {
	return;
}

// Done.
crop_image($source_file);




