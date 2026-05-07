import { startOverlay } from './app.js';

const params = new URLSearchParams(location.search);
const channelId = params.get('channelId') || 'dev';

startOverlay({ stage: document.getElementById('stage'), channelId });
