/**
 * Script para remoção de console.log em produção
 * Este arquivo substitui todos os console.log por funções vazias em produção
 */

const isProduction = process.env.NODE_ENV === 'production';

// Override console methods in production
if (isProduction) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  // Manter console.warn e console.error para debugging crítico
}

export const cleanConsole = () => {
  if (isProduction) {
    // Remove all console.log calls in production
    const originalLog = console.log;
    console.log = () => {};
    return originalLog;
  }
  return console.log;
};