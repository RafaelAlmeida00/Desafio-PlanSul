SET client_encoding TO 'UTF8';

CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produtos (
    id BIGSERIAL PRIMARY KEY,
    categoria_id BIGINT REFERENCES categorias(id),
    sku VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    estoque_minimo INTEGER DEFAULT 0,
    marca VARCHAR(100) default 'Generico',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estoque (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT UNIQUE REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE tipo_movimentacao AS ENUM ('entrada', 'saida');

CREATE TABLE estoque_movimentacoes (
    id BIGSERIAL PRIMARY KEY,
    produto_id BIGINT REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL,
    tipo tipo_movimentacao NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nome, descricao) VALUES 
('Limpeza e Higienização', 'Produtos para limpeza e higienização de ambientes'),
('Utensílios de Limpeza', 'Materiais e utensílios utilizados para limpeza'),
('Consumíveis de Limpeza', 'Produtos consumíveis para limpeza diária');

INSERT INTO produtos (id, categoria_id, sku, nome, estoque_minimo, marca) VALUES 
(1, 1, 'LIM-001', 'Detergente Líquido 500ml', 10, 'Ypê'),
(2, 1, 'LIM-002', 'Água Sanitária 2L', 5, 'Candida'),
(3, 1, 'LIM-003', 'Cloro Gel 1L', 5, DEFAULT), 
(4, 2, 'UTI-001', 'Vassoura de Pelo Sintético', 2, 'Bettanin'),
(5, 2, 'UTI-002', 'Rodo de Alumínio 40cm', 2, 'Condor'),
(6, 2, 'UTI-003', 'Balde Plástico 20L', 3, DEFAULT),
(7, 3, 'CON-001', 'Esponja de Aço multiuso', 20, 'Assolan'),
(8, 3, 'CON-002', 'Luvas de Látex Amarela (M)', 10, 'Mucambo'),
(9, 3, 'CON-003', 'Pano de Chão Alvejado', 15, DEFAULT);

INSERT INTO estoque (produto_id, quantidade) VALUES
(1, 45),
(2, 0),
(3, 0),
(4, 0),
(5, 0),
(6, 0),
(7, 0),
(8, 0),
(9, 0);

INSERT INTO estoque_movimentacoes (produto_id, quantidade, tipo) VALUES
(1, 50, 'entrada'),
(1, 5, 'saida');

SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));
SELECT setval('produtos_id_seq', (SELECT MAX(id) FROM produtos));
SELECT setval('estoque_id_seq', (SELECT MAX(id) FROM estoque));
SELECT setval('estoque_movimentacoes_id_seq', (SELECT MAX(id) FROM estoque_movimentacoes));
