export function getHealth(_request, response) {
  response.json({
    status: 'ok',
    service: 'payment-guardian-backend'
  });
}