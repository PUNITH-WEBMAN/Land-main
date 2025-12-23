const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function prefetchAddresses() {
  try {
    console.log('Starting address prefetch...');

    // Read KMZ file
    const kmzPath = path.join(__dirname, '../public/18623.KMZ');
    const kmzData = fs.readFileSync(kmzPath);

    // Extract KML from KMZ
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(kmzData);

    let kmlString = null;
    for (const [filename, file] of Object.entries(loadedZip.files)) {
      if (filename.toLowerCase().endsWith('.kml') && !file.dir) {
        kmlString = await file.async('text');
        break;
      }
    }

    if (!kmlString) {
      throw new Error('No KML found in KMZ');
    }

    // Parse KML to get coordinates
    const parser = new (require('xmldom').DOMParser)();
    const kmlDoc = parser.parseFromString(kmlString);
    const placemarks = kmlDoc.getElementsByTagName('Placemark');

    const addressMap = {};
    const surveys = [];
    let processedCount = 0;

    // Process each placemark
    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const pointElement = placemark.getElementsByTagName('Point')[0];

      if (!pointElement) continue;

      const coordElement = pointElement.getElementsByTagName('coordinates')[0];
      if (!coordElement) continue;

      const coordText = coordElement.textContent.trim();
      const [lon, lat] = coordText.split(',').map(Number);

      if (!lon || !lat) continue;

      const nameElement = placemark.getElementsByTagName('name')[0];
      const name = nameElement ? nameElement.textContent.trim() : `Point ${i + 1}`;

      // Skip unnamed or zero points
      if (!name || name === '0' || name === 'Unnamed') continue;

      const key = `${lat.toFixed(6)},${lon.toFixed(6)}`;
      
      // Collect survey list for quick search
      surveys.push({ name, lat: Number(lat.toFixed(6)), lon: Number(lon.toFixed(6)) });
      
      try {
        // Fetch address from Nominatim with delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log(`Processing [${processedCount + 1}] Survey ${name}: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          {
            headers: {
              'User-Agent': 'PlotIQ-Prefetch'
            }
          }
        );

        if (!response.ok) {
          console.warn(`Failed to fetch address for ${name}`);
          addressMap[key] = `${name}, Alahalli, Bangalore`;
          continue;
        }

        const data = await response.json();
        const addr = data.address || {};
        
        // Format address as: Survey Number, Street/Road, Area, City
        const parts = [name]; // Start with survey number
        
        // Add street/road (priority order)
        if (addr.road) {
          parts.push(addr.road);
        } else if (addr.street) {
          parts.push(addr.street);
        } else if (addr.residential) {
          parts.push(addr.residential);
        }
        
        // Add detailed area information
        const areaInfo = [];
        
        // Add neighbourhood/suburb/district (in priority order)
        if (addr.neighbourhood) {
          areaInfo.push(addr.neighbourhood);
        } else if (addr.suburb) {
          areaInfo.push(addr.suburb);
        } else if (addr.city_district) {
          areaInfo.push(addr.city_district);
        } else if (addr.county) {
          areaInfo.push(addr.county);
        }
        
        // Add state/province if different from city
        if (addr.state && addr.state !== 'Karnataka') {
          areaInfo.push(addr.state);
        }
        
        // Add city if available
        if (addr.city && addr.city !== 'Bangalore' && addr.city !== 'Bengaluru') {
          areaInfo.push(addr.city);
        } else {
          areaInfo.push('Bangalore');
        }
        
        // If no street found, add area info directly
        if (areaInfo.length > 0) {
          parts.push(areaInfo.join(', '));
        } else {
          parts.push('Alahalli, Bangalore');
        }
        
        const address = parts.join(', ');
        addressMap[key] = address;
        processedCount++;
        console.log(`✓ Survey ${name}: ${address}`);
      } catch (error) {
        console.error(`Error fetching address for survey ${name}:`, error.message);
        addressMap[key] = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      }
    }

    // Write to JSON files
    const addressesPath = path.join(__dirname, '../public/addresses.json');
    fs.writeFileSync(addressesPath, JSON.stringify(addressMap, null, 2));

    const surveysPath = path.join(__dirname, '../public/surveys.json');
    fs.writeFileSync(surveysPath, JSON.stringify(surveys, null, 2));

    console.log(`\n✅ Prefetch complete! Processed ${processedCount} addresses.`);
    console.log(`Saved addresses to: ${addressesPath}`);
    console.log(`Saved surveys to: ${surveysPath}`);
  } catch (error) {
    console.error('Prefetch failed:', error);
    process.exit(1);
  }
}

prefetchAddresses();
