// Public API for the Whiteboard module
// Only export what the rest of the app needs to use

export { default as Whiteboard } from './Whiteboard';

// Module configuration for AppShell
export { moduleConfig } from './config';

// Re-export constants that might be needed by other parts of the app
export { DEFAULT_TOOL } from './constants/tools';
