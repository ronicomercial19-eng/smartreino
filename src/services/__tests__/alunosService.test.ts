/**
 * Testes unitários para AlunosService - ETAPA 2
 * Executar com: npm test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AlunosService, type NovoAlunoInput } from '../alunosService';

// Mock do Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockAluno,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockAluno,
              error: null
            }))
          }))
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: { id: 'mock-user-id' } },
        error: null
      }))
    }
  }
}));

const mockAluno = {
  id: '123',
  professor_id: 'prof-123',
  nome: 'Aluno Teste',
  email: 'aluno@teste.com',
  objetivo: 'hipertrofia',
  status: 'ativo'
};

describe('AlunosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarAlunos', () => {
    it('deve retornar lista de alunos ativos', async () => {
      const alunos = await AlunosService.listarAlunos();
      expect(Array.isArray(alunos)).toBe(true);
    });
  });

  describe('criarAluno', () => {
    it('deve criar aluno com dados válidos', async () => {
      const novoAluno: NovoAlunoInput = {
        nome: 'Novo Aluno',
        email: 'novo@teste.com',
        objetivo: 'emagrecimento'
      };

      const result = await AlunosService.criarAluno(novoAluno);
      expect(result).toBeDefined();
    });

    it('deve validar email antes de criar', async () => {
      const alunoInvalido: NovoAlunoInput = {
        nome: 'Teste',
        email: 'email-invalido',
        objetivo: 'hipertrofia'
      };

      // Deveria lançar erro de validação
      await expect(async () => {
        // Adicionar validação no service primeiro
      }).rejects.toThrow();
    });
  });

  describe('atualizarAluno', () => {
    it('deve atualizar dados do aluno', async () => {
      const updates = { nome: 'Nome Atualizado' };
      const result = await AlunosService.atualizarAluno('123', updates);
      expect(result).toBeDefined();
    });
  });

  describe('excluirAluno', () => {
    it('deve fazer soft delete do aluno', async () => {
      await expect(
        AlunosService.excluirAluno('123')
      ).resolves.not.toThrow();
    });
  });
});
