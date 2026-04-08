-- Remove o prefixo "R$ " dos preços existentes, mantendo apenas o valor numérico (ex: 49,90)
UPDATE presentes
SET preco = TRIM(REPLACE(preco, 'R$', ''))
WHERE preco IS NOT NULL AND preco LIKE 'R$%';
