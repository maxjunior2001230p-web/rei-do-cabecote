-- Massa de dados demonstrativa para o Rei do Cabecote.
-- Execute depois de iniciar o backend pelo menos uma vez, para o Hibernate criar as tabelas.
-- PowerShell:
-- psql -U postgres -d reidocabecote -f .\seed-demo.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- IDs fixos tornam o script repetivel sem criar duplicatas.
-- A limpeza e limitada aos registros desta massa e ao administrador padrao.
DELETE FROM "servico_peca"
WHERE servico_id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005'
);

DELETE FROM "servico"
WHERE id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000005'
);

DELETE FROM produto_venda
WHERE id IN (
  '60000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000002',
  '60000000-0000-0000-0000-000000000003',
  '60000000-0000-0000-0000-000000000004',
  '60000000-0000-0000-0000-000000000005'
);

DELETE FROM veiculo
WHERE id IN (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000005'
);

DELETE FROM peca
WHERE id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

DELETE FROM fornecedor
WHERE id IN (
  '50000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000003'
);

DELETE FROM cliente
WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004'
);

DELETE FROM usuario
WHERE email IN ('admin@admin.com', 'atendimento@reidocabecote.com');

INSERT INTO usuario (id, nome, email, senha, cargo) VALUES
('70000000-0000-0000-0000-000000000001', 'Administrador', 'admin@admin.com', crypt('admin123', gen_salt('bf')), 'ADMIN'),
('70000000-0000-0000-0000-000000000002', 'Marina Atendimento', 'atendimento@reidocabecote.com', crypt('atendimento123', gen_salt('bf')), 'Funcionario');

INSERT INTO cliente (id, nome, cpf, endereco, telefone) VALUES
('10000000-0000-0000-0000-000000000001', 'Carlos Henrique Souza', '12345678901', 'Rua das Oficinas, 120 - Contagem/MG', '(31)99999-1001'),
('10000000-0000-0000-0000-000000000002', 'Fernanda Alves Martins', '23456789012', 'Av. Amazonas, 845 - Belo Horizonte/MG', '(31)99999-1002'),
('10000000-0000-0000-0000-000000000003', 'Joao Pedro Ribeiro', '34567890123', 'Rua Itajuba, 44 - Betim/MG', '(31)99999-1003'),
('10000000-0000-0000-0000-000000000004', 'Oficina Norte Ltda', '45678901234', 'Av. Presidente Vargas, 300 - Contagem/MG', '(31)99999-1004');

INSERT INTO veiculo (id, placa, modelo, montadora, ano_modelo, ano_fabricacao, cor, cambio, cliente_id) VALUES
('20000000-0000-0000-0000-000000000001', 'QWE1A23', 'Civic', 'Honda', '2020', '2019', 'Prata', 'AUTOMATICO', '10000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000002', 'RBT4B56', 'Onix', 'Chevrolet', '2022', '2021', 'Branco', 'MANUAL', '10000000-0000-0000-0000-000000000002'),
('20000000-0000-0000-0000-000000000003', 'GHP7C89', 'Corolla', 'Toyota', '2018', '2017', 'Cinza', 'CVT', '10000000-0000-0000-0000-000000000003'),
('20000000-0000-0000-0000-000000000004', 'JMK2D10', 'HB20', 'Hyundai', '2023', '2022', 'Preto', 'AUTOMATICO', '10000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000005', 'NPL5E42', 'Ranger', 'Ford', '2019', '2018', 'Azul', 'AUTOMATICO', '10000000-0000-0000-0000-000000000001');

INSERT INTO fornecedor (id, nome, cnpj, endereco, complemento, contato, categoria) VALUES
('50000000-0000-0000-0000-000000000001', 'Auto Parts Minas', '12.345.678/0001-90', 'Rua dos Motores, 80 - Contagem/MG', 'Galpao 2', '(31)3333-1001', 'Pecas'),
('50000000-0000-0000-0000-000000000002', 'Distribuidora Motor Forte', '23.456.789/0001-01', 'Av. Industrial, 450 - Betim/MG', 'Sala 4', '(31)3333-1002', 'Materiais'),
('50000000-0000-0000-0000-000000000003', 'Ferramentas Pro Oficina', '34.567.890/0001-12', 'Rua do Aco, 210 - BH/MG', 'Loja 1', '(31)3333-1003', 'Ferramentas');

INSERT INTO peca (id, nome, descricao, preco, fornecedor, situacao) VALUES
('40000000-0000-0000-0000-000000000001', 'Junta do cabecote', 'Junta metalica para motores flex.', 289.90, 'Auto Parts Minas', 'Ativo'),
('40000000-0000-0000-0000-000000000002', 'Parafuso do cabecote', 'Jogo com 10 parafusos novos.', 179.50, 'Auto Parts Minas', 'Ativo'),
('40000000-0000-0000-0000-000000000003', 'Retentor de valvula', 'Kit com retentores de alta resistencia.', 96.00, 'Distribuidora Motor Forte', 'Ativo'),
('40000000-0000-0000-0000-000000000004', 'Valvula de admissao', 'Valvula original para reposicao.', 148.75, 'Distribuidora Motor Forte', 'Ativo'),
('40000000-0000-0000-0000-000000000005', 'Kit corrente de comando', 'Kit completo com tensionador.', 624.90, 'Auto Parts Minas', 'Ativo'),
('40000000-0000-0000-0000-000000000006', 'Fluido para usinagem', 'Fluido concentrado para acabamento.', 72.40, 'Ferramentas Pro Oficina', 'Inativo');

-- TipoPagamento e armazenado como ordinal: 0 DINHEIRO, 1 CARTAO_CREDITO, 2 CARTAO_DEBITO, 3 PIX, 4 BOLETO.
INSERT INTO servico (id, descricao, tipo, status, preco, data_criacao, data_prevista, mao_de_obra, tipo_pagamento, garantia, veiculo_id, cliente_id) VALUES
('30000000-0000-0000-0000-000000000001', 'Retifica completa do cabecote', 'Retifica', 'Concluido', 1240.00, CURRENT_DATE - 45, CURRENT_DATE - 35, 770.60, 3, CURRENT_DATE + 145, '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', 'Troca de junta e parafusos', 'Manutencao', 'Em andamento', 760.00, CURRENT_DATE - 18, CURRENT_DATE + 2, 290.60, 1, CURRENT_DATE + 182, '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000003', 'Revisao de valvulas', 'Revisao', 'Pendente', 980.00, CURRENT_DATE - 8, CURRENT_DATE + 7, 735.25, 3, CURRENT_DATE + 187, '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000004', 'Diagnostico e usinagem', 'Diagnostico', 'Concluido', 1130.00, CURRENT_DATE - 72, CURRENT_DATE - 65, 708.60, 0, CURRENT_DATE + 120, '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004'),
('30000000-0000-0000-0000-000000000005', 'Preparacao para montagem', 'Montagem', 'Cancelado', 0.00, CURRENT_DATE - 12, CURRENT_DATE - 5, 0.00, 4, NULL, '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001');

INSERT INTO "servico_peca" (servico_id, peca_id) VALUES
('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001'),
('30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004'),
('30000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000005'),
('30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000006');

-- StatusVenda e armazenado como ordinal: 0 DISPONIVEL, 1 VENDIDO.
INSERT INTO produto_venda (id, nome, descricao, quantidade, preco_venda, categoria, status_venda, nome_arquivo_imagem) VALUES
('60000000-0000-0000-0000-000000000001', 'Cabecote Honda Civic', 'Cabecote revisado e pronto para montagem.', 2, 1850.00, 'Cabecotes', 0, NULL),
('60000000-0000-0000-0000-000000000002', 'Kit valvulas Toyota', 'Conjunto de valvulas para motores Toyota.', 4, 690.00, 'Componentes', 0, NULL),
('60000000-0000-0000-0000-000000000003', 'Bomba de oleo Ford', 'Bomba revisada com garantia de 90 dias.', 1, 420.00, 'Componentes', 0, NULL),
('60000000-0000-0000-0000-000000000004', 'Cabecote Chevrolet Onix', 'Produto vendido para demonstrar o estado de vitrine.', 0, 2100.00, 'Cabecotes', 1, NULL),
('60000000-0000-0000-0000-000000000005', 'Jogo de tuchos', 'Jogo completo para reposicao.', 0, 350.00, 'Componentes', 1, NULL);

COMMIT;

-- Login de teste: admin@admin.com / admin123
-- Login auxiliar: atendimento@reidocabecote.com / atendimento123
