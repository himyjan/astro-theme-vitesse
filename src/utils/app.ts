// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Deck } from '@deck.gl/core'
import { GeoJsonLayer, IconLayer } from '@deck.gl/layers'

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'
const API_URL = 'https://api.waqi.info/v2/map/bounds/'
const TOKEN = import.meta.env.PUBLIC_TOKEN
const BOUNDS = '-90,-180,90,180'

async function fetchAqiData(bounds: string) {
  const response = await fetch(`${API_URL}?latlng=${bounds}&token=${TOKEN}`)
  const data = await response.json()
  if (data.status === 'ok') {
    return data.data.map((station: any) => ({
      coordinates: [station.lat, station.lon],
      aqi: Number.parseInt(station.aqi, 10),
      name: station.station.name,
    }))
  }
  else {
    throw new Error('Failed to fetch AQI data')
  }
}

const INITIAL_VIEW_STATE = {
  latitude: 24.91571,
  longitude: 121.6739,
  zoom: 4,
  bearing: 0,
  pitch: 30,
}

async function initializeDeck() {
  try {
    const aqiData = await fetchAqiData(BOUNDS)

    // eslint-disable-next-line no-new
    new Deck({
      initialViewState: INITIAL_VIEW_STATE,
      controller: true,
      layers: [
        new GeoJsonLayer({
          id: 'base-map',
          data: COUNTRIES,
          stroked: true,
          filled: true,
          lineWidthMinPixels: 2,
          opacity: 0.4,
          getLineColor: [60, 60, 60],
          getFillColor: [200, 200, 200],
        }),
        new IconLayer({
          id: 'icon-layer',
          data: aqiData,
          iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png', // Replace with your own icon atlas if needed
          iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json', // Replace with your own mapping if needed
          // eslint-disable-next-line unused-imports/no-unused-vars
          getIcon: d => 'marker', // Icon identifier from iconMapping
          getPosition: d => [d.coordinates[1], d.coordinates[0]],
          getSize: 40, // Adjust icon size
          getColor: (d) => {
            if (d.aqi <= 50)
              return [0, 255, 0, 255] // Green
            if (d.aqi <= 100)
              return [255, 255, 0, 255] // Yellow
            if (d.aqi <= 150)
              return [255, 165, 0, 255] // Orange
            if (d.aqi <= 200)
              return [255, 0, 0, 255] // Red
            if (d.aqi <= 300)
              return [128, 0, 128, 255] // Purple
            return [128, 0, 0, 255] // Maroon
          },
          pickable: true,
        }),
      ],
    })
  }
  catch (error) {
    console.error('Error initializing deck:', error)
  }
}

initializeDeck()
