// scripts/generate-icons.mjs
import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

// Simple black square with "L" text as SVG source
const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#111111"/>
  <text
    x="256"
    y="320"
    font-family="monospace"
    font-size="280"
    font-weight="bold"
    fill="#F5F5F5"
    text-anchor="middle"
  >L</text>
</svg>
`

const svgBuffer = Buffer.from(svg)

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`)
  console.log(`Generated ${size}x${size}`)
}

console.log('All icons generated.')