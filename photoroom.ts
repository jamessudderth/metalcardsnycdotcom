import fetch from 'node-fetch';
import { FormData } from 'formdata-node';
import fs from 'fs';
import path from 'path';

if (!process.env.PHOTOROOM_API_KEY) {
  console.warn('PHOTOROOM_API_KEY environment variable is not set');
}

const API_KEY = process.env.PHOTOROOM_API_KEY;
const API_URL = 'https://sdk.photoroom.com/v1/segment';

export interface PhotoroomResult {
  success: boolean;
  processedImageUrl?: string;
  error?: string;
}

export async function removeBackground(imageBuffer: Buffer, fileName: string): Promise<PhotoroomResult> {
  try {
    if (!API_KEY) {
      return {
        success: false,
        error: 'Photoroom API key is not configured. Please add your PHOTOROOM_API_KEY to environment variables.'
      };
    }

    const formData = new FormData();
    formData.append('image_file', imageBuffer, fileName);
    formData.append('size', 'preview'); // or 'full' for higher quality

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Photoroom API error:', response.status, errorText);
      return {
        success: false,
        error: `API call failed: ${response.status} ${response.statusText}`
      };
    }

    const processedImageBuffer = await response.buffer();
    
    // Save the processed image to a temporary location
    const outputFileName = `processed_${Date.now()}_${fileName}`;
    const outputPath = path.join('public', 'processed-images', outputFileName);
    
    // Ensure the directory exists
    const dirPath = path.dirname(outputPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, processedImageBuffer);
    
    return {
      success: true,
      processedImageUrl: `/processed-images/${outputFileName}`
    };
  } catch (error) {
    console.error('Photoroom processing error:', error);
    return {
      success: false,
      error: 'Failed to process image. Please try again.'
    };
  }
}

export async function removeBackgroundBase64(base64Image: string): Promise<PhotoroomResult> {
  try {
    if (!API_KEY) {
      return {
        success: false,
        error: 'Photoroom API key is not configured. Please add your PHOTOROOM_API_KEY to environment variables.'
      };
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        image_file_b64: base64Image,
        size: 'preview'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Photoroom API error:', response.status, errorText);
      return {
        success: false,
        error: `API call failed: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    
    // Save the processed image
    const outputFileName = `processed_${Date.now()}.png`;
    const outputPath = path.join('public', 'processed-images', outputFileName);
    
    // Ensure the directory exists
    const dirPath = path.dirname(outputPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Convert base64 to buffer and save
    const imageBuffer = Buffer.from(data.result_b64, 'base64');
    fs.writeFileSync(outputPath, imageBuffer);
    
    return {
      success: true,
      processedImageUrl: `/processed-images/${outputFileName}`
    };
  } catch (error) {
    console.error('Photoroom processing error:', error);
    return {
      success: false,
      error: 'Failed to process image. Please try again.'
    };
  }
}