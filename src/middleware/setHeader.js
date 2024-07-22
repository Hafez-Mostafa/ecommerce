
export const setHeaders = () => {
    return async (req, res, next) => {
        const unwantedHeaders = [
        'cdn-loop',
        'cf-connecting-ip',
        'cf-ew-via',
        'cf-ipcountry',
        'cf-ray',
        'cf-visitor',
        'cf-worker',
        'render-proxy-ttl',
        'rndr-id',
        'true-client-ip',
        'x-forwarded-for',
        'x-forwarded-proto',
        'x-request-start'
      ];
    
      unwantedHeaders.forEach(header => {
        delete req.headers[header.toLowerCase()];
      });
 
      next()
    }
   }
   