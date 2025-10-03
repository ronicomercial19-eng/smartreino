/**
 * Serviço de Segurança e Compliance - ETAPA 1
 * Validações, sanitização e auditoria
 */

import { logger } from "@/utils/logger";

export class SecurityService {
  /**
   * Validar email (LGPD - evitar injeção)
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (!isValid) {
      logger.warn('Email inválido detectado', 'SecurityService.validateEmail', { email });
    }
    
    return isValid;
  }

  /**
   * Sanitizar input de texto (prevenir XSS)
   */
  static sanitizeText(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validar telefone brasileiro
   */
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validar CPF (para dados sensíveis de alunos)
   */
  static validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  /**
   * Mascarar dados sensíveis para logs (LGPD compliance)
   */
  static maskSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) return data;

    const masked = { ...data };
    const sensitiveFields = ['email', 'telefone', 'cpf', 'senha', 'password'];

    for (const key in masked) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        const value = masked[key];
        if (typeof value === 'string' && value.length > 3) {
          masked[key] = value.substring(0, 3) + '***';
        }
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    }

    return masked;
  }

  /**
   * Verificar conformidade LGPD de dados de aluno
   */
  static checkLGPDCompliance(alunoData: any): { compliant: boolean; issues: string[] } {
    const issues: string[] = [];

    // Verificar consentimento implícito (professor como responsável)
    if (!alunoData.professor_id) {
      issues.push('Professor não identificado - violação de responsabilidade');
    }

    // Verificar dados mínimos necessários
    const requiredFields = ['nome', 'email', 'objetivo'];
    for (const field of requiredFields) {
      if (!alunoData[field]) {
        issues.push(`Campo obrigatório ausente: ${field}`);
      }
    }

    // Validar email
    if (alunoData.email && !this.validateEmail(alunoData.email)) {
      issues.push('Email em formato inválido');
    }

    // Verificar se há dados sensíveis de saúde sem observação de consentimento
    if ((alunoData.restricoes_medicas || alunoData.peso_atual || alunoData.altura_cm) 
        && !alunoData.observacoes) {
      issues.push('Dados de saúde sem observação de consentimento');
    }

    logger.info('Verificação LGPD realizada', 'SecurityService.checkLGPDCompliance', {
      compliant: issues.length === 0,
      issuesCount: issues.length
    });

    return {
      compliant: issues.length === 0,
      issues
    };
  }

  /**
   * Auditoria de acesso a dados sensíveis
   */
  static async auditDataAccess(
    userId: string, 
    action: 'read' | 'write' | 'delete', 
    resourceType: string, 
    resourceId: string
  ): Promise<void> {
    logger.info('Auditoria de acesso', 'SecurityService.auditDataAccess', {
      userId,
      action,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Verificar força de senha (se implementarmos auth customizado)
   */
  static checkPasswordStrength(password: string): { 
    isStrong: boolean; 
    score: number; 
    feedback: string[] 
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 25;
    else feedback.push('Senha deve ter no mínimo 8 caracteres');

    if (/[a-z]/.test(password)) score += 25;
    else feedback.push('Adicione letras minúsculas');

    if (/[A-Z]/.test(password)) score += 25;
    else feedback.push('Adicione letras maiúsculas');

    if (/[0-9]/.test(password)) score += 15;
    else feedback.push('Adicione números');

    if (/[^a-zA-Z0-9]/.test(password)) score += 10;
    else feedback.push('Adicione caracteres especiais');

    return {
      isStrong: score >= 75,
      score,
      feedback
    };
  }
}
