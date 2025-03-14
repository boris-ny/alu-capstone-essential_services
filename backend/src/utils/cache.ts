import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: parseInt(process.env.PLACES_CACHE_DURATION || '3600'),
  checkperiod: 120
});

export default cache;