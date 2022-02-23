import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsLocale,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * ref: https://developer.apple.com/documentation/snapshots/create_a_maps_web_snapshot
 */
export class SnapshotParamsDto {
  /**
   * The center is either one of the following:
   * - latitude and longitude seperated by a comma
   * - a geocoded address (e.g. "1 Apple Park Way in Cupertino, California")
   * - auto (default)
   */
  @IsString()
  @IsOptional()
  center = 'auto';

  /**
   * The zoom level of the map.
   * It must be a floating number between 3 and 20.
   * The default is 12.
   *
   * The zoom level is ignored if the center is `auto` or
   * when both `coordinateSpan` and `zoomLevel` are specified
   */
  @IsInt()
  @IsOptional()
  @Min(3)
  @Max(20)
  zoomLevel = 12;

  /**
   * A comma-seperated coordinate span that indicates how much
   * of the map should be displayed around the center of the map.
   *
   * The latitude must be between the range of 0 and 90.
   * The longitude must be between the range of 0 and 180.
   *
   * The latitude and longitude delta parameters must be
   * positive numbers, everything else will be threated as 0.
   *
   * The coordinate span is ignored if the center is `auto`,
   * if both `coordinateSpan` and `zoomLevel` are specified,
   * coordinate span will be used.
   */
  @IsString()
  @IsOptional()
  coordinateSpan?: string;

  /**
   * The size of the image in pixels.
   * The default is 600x400.
   * Use the format `widthxheight`.
   */
  @IsString()
  @IsOptional()
  size = '600x400';

  /**
   * The pixel density of the image.
   * The default value is 1.
   * The pixel size will be increased x times if this is specified.
   */
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(2)
  scale = 1;

  /**
   * The map type, the following options are available:
   * - hybrid
   * - satellite
   * - mutedStandard
   * - standard (default)
   */
  @IsEnum(['hybrid', 'satellite', 'mutedStandard', 'standard'])
  @IsOptional()
  type: 'hybrid' | 'satellite' | 'mutedStandard' | 'standard' = 'standard';

  /**
   * The color scheme of the map.
   * Dark will only be applied if the map type is standard or muted standard.
   */
  @IsEnum(['light', 'dark'])
  @IsOptional()
  colorScheme: 'light' | 'dark' = 'light';

  /**
   * A boolean value that indicates whether the map should
   * show points of interest on the map.
   */
  @IsBoolean()
  @IsOptional()
  showPoints = true;

  /**
   * The language of the labels displayed on the map.
   * Supported values are locale IDs, such as en-GB or es-MX.
   */
  @IsLocale()
  @IsOptional()
  language = 'en-US';

  @ValidateNested({ each: true })
  @Type(() => Annotation)
  annotations?: Annotation[];

  @ValidateNested({ each: true })
  @Type(() => Overlay)
  overlays?: [Overlay];

  /**
   * The referrer string value. Requests that don't match the
   * referrer value will fail with a 401 Unauthorized response.
   * This is not required, but recommended.
   */
  @IsString()
  @IsOptional()
  referrer?: string;

  /**
   * The time in seconds from epoch at which the request expires.
   * Expired requests will fail with a 401 Unauthorized response.
   * This is not required, but recommended.
   */
  @IsInt()
  @IsOptional()
  expires?: number;

  @ValidateNested({ each: true })
  @Type(() => Image)
  images?: [Image];
}

export class DataSnapshotParamsDto extends SnapshotParamsDto {
  /**
   * Add the base64 prefix to the image data.
   * The default is true.
   */
  @IsOptional()
  @IsBoolean()
  withPrefix = true;
}

/**
 * ref: https://developer.apple.com/documentation/snapshots/annotation
 */
export class Annotation {
  /**
   * The color of the annotation.
   * It can either be a HTML color name or a hex value.
   * If the annotation has an "image" markerStyle, the color
   * will be ignored.
   */
  @IsOptional()
  @IsString()
  color?: string;

  /**
   * A single alphanumeric character {a-z, A-Z, 0-9} that
   * will be displayed inside the annotation.
   * If the annotation has a "dot" or "image" markerStyle,
   * the character will be ignored.
   */
  @IsOptional()
  @IsString()
  @Length(1, 1)
  glyphText?: string;

  /**
   * The style of the annotation. Supported values are:
   * - dot
   * - balloon (default)
   * - large
   * - image (this also needs imgIdx to be specified)
   */
  @IsOptional()
  @IsEnum(['dot', 'balloon', 'large', 'image'])
  markerStyle: 'dot' | 'balloon' | 'large' | 'image' = 'balloon';

  /**
   * A single point that defines the location at which
   * the annotation should be placed. Supported formats are:
   * - latitude and longitude seperated by a comma
   * - a geocoded address (e.g. "1 Apple Park Way in Cupertino, California")
   * - "center"
   */
  @IsOptional()
  @IsString()
  point?: string;

  /**
   * The zero-based index of the image to use for the annotation.
   * It's a reference to the images array in the request.
   * It is required if the markerStyle is "image".
   */
  @IsOptional()
  @IsInt()
  imgIdx?: number;

  /**
   * The optional offset in scale independent pixels of the image from the bottom center.
   * The offset is specified as a comma-seperated string with x and y values.
   * The value is only used if the markerStyle is "image".
   */
  @IsOptional()
  @IsString()
  offset?: string;
}

/**
 * ref: https://developer.apple.com/documentation/snapshots/overlay
 */
export class Overlay {
  /**
   * An array of coordinates, specified as latitude and longitude coordinate pairs.
   */
  @IsArray()
  @Type(() => String)
  points: string[];

  /**
   * The color of the line between each point.
   * It can either be a HTML color name or a hex value.
   */
  @IsOptional()
  @IsString()
  strokeColor?: string;

  /**
   * The width if the line, in CSS pixels.
   */
  @IsOptional()
  @IsInt()
  lineWidth?: number;

  /**
   * An array that defines a line's dash pattern,
   * where numbers represent line and gap lengths in CSS pixels.
   * For example, [10, 5] will draw a line of 10 pixels followed by a gap of 5 pixels.
   * An empty array draws a solid line, which is the default.
   */
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  lineDash?: number[];
}

/**
 * ref: https://developer.apple.com/documentation/snapshots/image
 */
export class Image {
  /**
   * The width of the image in scale-independent pixels.
   */
  @IsInt()
  width: number;

  /**
   * The height of the image in scale-independent pixels.
   */
  @IsInt()
  height: number;

  /**
   * The full URL that specifies the location of the image.
   * A Base64 data URL can also be specified.
   */
  @IsString()
  url: string;
}
