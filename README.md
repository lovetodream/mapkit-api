# Mapkit Snapshots API

[![Default CI](https://github.com/lovetodream/mapkit-api/actions/workflows/default.ci.yml/badge.svg)](https://github.com/lovetodream/mapkit-api/actions/workflows/default.ci.yml)
[![MIT License](https://img.shields.io/github/license/lovetodream/mapkit-api)](https://github.com/lovetodream/mapkit-api/blob/master/LICENSE)

This API serves Apple [Mapkit Snapshots/Maps Web Snapshots](https://developer.apple.com/documentation/snapshots) as signed urls, raw data (as base64) and PNG images.

## Installation

You can install the API either through docker

```bash
docker pull ghcr.io/lovetodream/mapkit-api:latest
```

or build it from source

```bash
git clone https://github.com/lovetodream/mapkit-api.git
cd mapkit-api
npm install
npm run build
npm run start:prod
```

## Environment Variables

To run the API, you will need to add the following environment variables to your environment (.env, docker-compose.yml, etc.). The values for these variables need to be optained from your Apple Developer Account. For more information visit the [Apple Developer Documentation](https://developer.apple.com/documentation/snapshots/generating_a_url_and_signature_to_create_a_maps_web_snapshot).

| Variable | Value |
|---|---|
| `KEY` | Private Key (contents from the .p8 file) |
| `KEY_ID` | Key ID of your private key |
| `TEAM_ID` | The Team ID of your Apple Developer Account |

## Deployment

You can deploy the API with docker compose.

**⚠️ Please be aware**:  
The API doesn't put any security measures in place. If they are needed, you need to at them yourself (eg. reverse proxy, load balancing...).

```yml
version: '3.9'
services:
  mapkit:
    image: ghcr.io/lovetodream/mapkit-api:latest
    ports:
      - '3000:3000'
    environment:
      KEY: |
        -----BEGIN PRIVATE KEY-----
        thisisasupersecurekey:)
        -----END PRIVATE KEY-----
      KEY_ID: 'KEY_ID_VALUE'
      TEAM_ID: 'TEAM_ID_VALUE'
```

## API Reference

Parameters need to be sent inside the body as json.

### Parameters for every /snapshot/* endpoint

For more detailed information have a look at [this file](https://github.com/lovetodream/mapkit-api/blob/master/src/dto/snapshot-params.dto.ts).

| Parameter | Type     | Description                |
|-----------|----------|----------------------------|
| `center` | `String` | **Optional**. The center of the map, `auto` by default. |
| `zoomLevel` | `Int` | **Optional**. The zoom level of the map, `12` by default (`3` - `20`), ignored if center is `auto`. |
| `coordinateSpan` | `String` | **Optional**. A comma-seperated coordinate span that indicates how much of the map should be displayed around the center of the map. If `zoomLevel` and `coordinateSpan` are specified, `coordinateSpan` will be used. |
| `size` | `String` | **Optional**. [width]x[height], 600x400 by default. |
| `scale` | `Int` | **Optional**. The pixel density of the image. Can be 1 or 2. |
| `type` | `Enum String` | **Optional**. `hybrid`, `satellite`, `mutedStandard`, `standard` (default) |
| `colorScheme` | `Enum String` | **Optional**. `light` (default), `dark` |
| `showPoints` | `Bool` | **Optional**. Show points of interest on the maps, true by default. |
| `language` | `String` | **Optional**. The language of the labels on the map. Locale IDs are supported, `en-US` by default. |
| `annotations` | `Array<Annotation>` | **Optional**. An array of annotations displayed on the map. |
| `overlays` | `Array<Overlay>` | **Optional**. An array of overlays displayed on the map. |
| `referrer` | `String` | **Optional**. The referrer string value. Requests that don't match the referrer value will fail with a `401 Unauthorized` response. |
| `expires` | `Int` | **Optional**. The time in seconds from epoch at which the request expires. Expired requests will fail with a `401 Unauthorized` response. |
| `images` | `Array<Image>` | **Optional**. An array of images used in annotations or overlays. |

#### Annotation

| Parameter | Type | Description |
|---|---|---|
| `color` | `String` | **Optional**. The color of the annotations. Can be hex value or HTML color name. Will be ignored if `markerStyle` is `image`. |
| `glyphText` | `String` | **Optional**. A single alphanumeric character that will be displayed inside the annotation. Will be ignored if `markerStyle` is `dot` or `image`. |
| `markerStyle` | `Enum String` | **Optional**. `dot`, `balloon` (default), `large`, `image` |
| `point` | `String` | **Optional**. The position of the point on the map. |
| `imgIdx` | `Int` | **Optional**. The zero-based index of the image (inside the `images` array) to use for the annotation. |
| `offset` | `String` | **Optional**. The offset from the bottom center specified as a comma-seperated string with x and y values. Only used if `markerStyle` is `image`. |

#### Overlay

| Parameter | Type | Description |
|---|---|---|
| `points` | `Array<String>` | **Required**. An array of coordinates, specified as latitude and longitude coordinate pairs. |
| `strokeColor` | `String` | **Optional**. The color of the line between each point. It can either be a HTML color name or a hex value. |
| `lineWidth` | `Int` | **Optional**. The width of the line, in CSS pixels.
| `lineDash` | `Array<Int>` | **Optional**. An array that defines the dash pattern of a line, where numbers represent the line and gap lengths in CSS pixels. [line, gap], by default it will draw a solid line. |

#### Image

| Parameter | Type | Description |
|---|---|---|
| `width` | `Int` | **Required**. The width of the image in scale-independent pixels. |
| `height` | `Int` | **Required**. The height of the image in scale-independent pixels. |
| `url` | `String` | **Required**. The full URL that specifies the location of the image. A Base64 data URL can also be specified. |

### Get basic health information

```http
GET /
```

### Get a snapshot url

```http
GET /snapshot/url
```

### Get snapshot data (base64)

```http
GET /snapshot/data
```

#### Additional parameters

| Parameter | Type     | Description                       |
|-----------|----------|-----------------------------------|
| `withPrefix` | `Bool` | **Optional**. Adds the base64 png prefix to the image data. `true` by default. |

### Get snapshot png image

```http
GET /snapshot/png
```

## Running Tests

To run unit tests, run the following command

```bash
npm test
```

To run end to end tests, run the following command

```bash
npm run test:e2e
```

## License

[MIT](https://github.com/lovetodream/mapkit-api/blob/master/LICENSE)
