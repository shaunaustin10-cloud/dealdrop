import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const BATCHDATA_API_KEY = process.env.BATCHDATA_API_KEY;

if (!BATCHDATA_API_KEY) {
  console.error("Error: BATCHDATA_API_KEY is not set in your .env file.");
  process.exit(1);
}

const INPUT_FILE = 'foreclosures.csv'; // You can change this to your CSV file
const OUTPUT_FILE = 'enriched_foreclosures.csv';

// Initialize the CSV writer
const csvWriter = createObjectCsvWriter({
  path: OUTPUT_FILE,
  header: [
    { id: 'Source', title: 'Source' },
    { id: 'Address', title: 'Address' },
    { id: 'Auction Date', title: 'Auction Date' },
    { id: 'Jurisdiction/County', title: 'Jurisdiction/County' },
    { id: 'Status', title: 'Status' },
    // Enrichment fields from BatchData
    { id: 'EstimatedValue', title: 'Estimated Value' },
    { id: 'OwnerName', title: 'Owner Name' },
    { id: 'OwnerType', title: 'Owner Type' },
    { id: 'Beds', title: 'Beds' },
    { id: 'Baths', title: 'Baths' },
    { id: 'SqFt', title: 'SqFt' },
    // Skip trace fields
    { id: 'Phone1', title: 'Phone 1' },
    { id: 'Phone1Type', title: 'Phone 1 Type' },
    { id: 'Phone2', title: 'Phone 2' },
    { id: 'Phone2Type', title: 'Phone 2 Type' }
  ]
});

// Sleep function to avoid hitting API rate limits
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPropertyData(address) {
  try {
    const response = await axios.post(
      'https://api.batchdata.com/api/v1/property/search',
      {
        searchCriteria: {
          query: address
        },
        skipTrace: true // This tells BatchData to also return phone numbers
      },
      {
        headers: {
          'Authorization': `Bearer ${BATCHDATA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`  [X] Error fetching data for ${address}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function processCSV() {
  console.log(`Starting BatchData enrichment & skip trace... Reading from ${INPUT_FILE}`);
  
  const results = [];
  
  // Read the CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_FILE)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Found ${results.length} rows. Starting API calls...`);
  
  const enrichedData = [];

  for (let i = 0; i < results.length; i++) {
    const row = results[i];
    const address = row['Address'];
    
    if (!address) {
      enrichedData.push(row);
      continue;
    }

    console.log(`Processing [${i + 1}/${results.length}]: ${address}`);
    
    const apiData = await getPropertyData(address);
    
    // Default values if API call fails or doesn't return data
    let enrichedRow = {
      ...row,
      EstimatedValue: '',
      OwnerName: '',
      OwnerType: '',
      Beds: '',
      Baths: '',
      SqFt: '',
      Phone1: '',
      Phone1Type: '',
      Phone2: '',
      Phone2Type: ''
    };

    if (apiData && apiData.results && apiData.results.properties && apiData.results.properties.length > 0) {
      const property = apiData.results.properties[0];
      
      // Extract data according to BatchData's typical response structure
      enrichedRow.EstimatedValue = property.valuation?.estimatedValue || '';
      enrichedRow.OwnerName = property.owner?.name?.first ? `${property.owner.name.first} ${property.owner.name.last}` : (property.owner?.name?.full || '');
      enrichedRow.OwnerType = property.owner?.type || '';
      enrichedRow.Beds = property.building?.bedrooms || '';
      enrichedRow.Baths = property.building?.bathrooms || '';
      enrichedRow.SqFt = property.building?.livingSqft || '';

      // Extract phone numbers from the skip trace result
      if (property.phones && property.phones.length > 0) {
        enrichedRow.Phone1 = property.phones[0].number || '';
        enrichedRow.Phone1Type = property.phones[0].type || '';
        
        if (property.phones.length > 1) {
          enrichedRow.Phone2 = property.phones[1].number || '';
          enrichedRow.Phone2Type = property.phones[1].type || '';
        }
      }
    }

    enrichedData.push(enrichedRow);
    
    // Add a short delay to respect rate limits (e.g., 5 requests per second)
    await sleep(200);
  }

  // Write enriched data to new CSV
  await csvWriter.writeRecords(enrichedData);
  console.log(`\nSuccess! Enriched data (with phone numbers) saved to ${OUTPUT_FILE}`);
}

processCSV();