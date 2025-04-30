module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/test/'  // Имя вашего репозитория
    : '/'
} 