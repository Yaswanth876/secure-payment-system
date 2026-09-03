export function success(response, data, status = 200) {
  return response.status(status).json({ success: true, data });
}

export function error(response, error) {
  return response.status(error.status || 500).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.status ? error.message : 'An internal error occurred.'
    },
    ...(error.data ? { data: error.data } : {})
  });
}