/**
 * Testes de segurança - ETAPA 2
 */

import { describe, it, expect } from 'vitest';
import { SecurityService } from '../securityService';

describe('SecurityService', () => {
  describe('validateEmail', () => {
    it('deve validar email correto', () => {
      expect(SecurityService.validateEmail('teste@email.com')).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      expect(SecurityService.validateEmail('email-invalido')).toBe(false);
      expect(SecurityService.validateEmail('sem@dominio')).toBe(false);
      expect(SecurityService.validateEmail('@semlocal.com')).toBe(false);
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPF válido', () => {
      expect(SecurityService.validateCPF('111.444.777-35')).toBe(true);
      expect(SecurityService.validateCPF('11144477735')).toBe(true);
    });

    it('deve rejeitar CPF inválido', () => {
      expect(SecurityService.validateCPF('000.000.000-00')).toBe(false);
      expect(SecurityService.validateCPF('111.111.111-11')).toBe(false);
      expect(SecurityService.validateCPF('123.456.789-00')).toBe(false);
    });
  });

  describe('sanitizeText', () => {
    it('deve sanitizar HTML perigoso', () => {
      const malicious = '<script>alert("XSS")</script>';
      const sanitized = SecurityService.sanitizeText(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('deve escapar caracteres especiais', () => {
      const text = 'Test & "quotes" <tags>';
      const sanitized = SecurityService.sanitizeText(text);
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
      expect(sanitized).toContain('&lt;');
    });
  });

  describe('maskSensitiveData', () => {
    it('deve mascarar dados sensíveis', () => {
      const data = {
        nome: 'João Silva',
        email: 'joao@email.com',
        cpf: '123.456.789-00',
        senha: 'senha123'
      };

      const masked = SecurityService.maskSensitiveData(data);
      expect(masked.nome).toBe('João Silva');
      expect(masked.email).toContain('***');
      expect(masked.cpf).toContain('***');
      expect(masked.senha).toContain('***');
    });
  });

  describe('checkPasswordStrength', () => {
    it('deve aprovar senha forte', () => {
      const result = SecurityService.checkPasswordStrength('Senha123!@#');
      expect(result.isStrong).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(75);
    });

    it('deve rejeitar senha fraca', () => {
      const result = SecurityService.checkPasswordStrength('123456');
      expect(result.isStrong).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });

  describe('checkLGPDCompliance', () => {
    it('deve aprovar dados compliant', () => {
      const alunoData = {
        professor_id: 'prof-123',
        nome: 'Aluno Teste',
        email: 'aluno@teste.com',
        objetivo: 'hipertrofia',
        observacoes: 'Consentimento obtido'
      };

      const result = SecurityService.checkLGPDCompliance(alunoData);
      expect(result.compliant).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('deve detectar violações LGPD', () => {
      const alunoData = {
        nome: 'Teste',
        email: 'email-invalido',
        objetivo: ''
      };

      const result = SecurityService.checkLGPDCompliance(alunoData);
      expect(result.compliant).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});
