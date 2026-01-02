import { readFileSync } from 'fs';
import { TicketConfig } from './types.js';

export function loadConfig(configPath: string): TicketConfig {
  try {
    const configData = readFileSync(configPath, 'utf-8');
    const config: TicketConfig = JSON.parse(configData);
    
    // Validate required fields
    if (!config.event || !config.event.artist || !config.event.date) {
      throw new Error('Invalid config: missing required event fields');
    }
    
    // Validate seatingFile is provided
    if (!config.seatingFile) {
      throw new Error('Invalid config: seatingFile is required');
    }
    
    // Validate includeQrCode is defined
    if (config.includeQrCode === undefined) {
      throw new Error('Invalid config: includeQrCode must be defined');
    }
    
    return config;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load config: ${error.message}`);
    }
    throw error;
  }
}

export function sanitizeFolderName(name: string): string {
  // Replace invalid filesystem characters with underscores
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
}

export function getOutputFolderName(artist: string, date: string): string {
  const sanitizedArtist = sanitizeFolderName(artist);
  const sanitizedDate = sanitizeFolderName(date);
  return `${sanitizedArtist}_${sanitizedDate}`;
}

