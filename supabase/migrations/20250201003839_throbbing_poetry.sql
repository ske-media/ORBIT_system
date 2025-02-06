/*
  # Ajout de la numérotation des devis

  1. Nouvelles Tables
    - `quote_sequences` : Gère les séquences de numérotation par année
      - `year` (integer, primary key)
      - `last_number` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Modifications
    - Ajout de la colonne `number` à la table `quotes`
    - Ajout de la colonne `quote_number` (format: DEVIS-YYYY-XXXX)
    
  3. Fonctions
    - `generate_quote_number()` : Génère automatiquement le numéro de devis
*/

-- Créer la table des séquences
CREATE TABLE quote_sequences (
  year integer PRIMARY KEY,
  last_number integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter les colonnes à la table quotes
ALTER TABLE quotes 
ADD COLUMN number integer,
ADD COLUMN quote_number text;

-- Créer un index sur quote_number
CREATE UNIQUE INDEX quotes_quote_number_idx ON quotes(quote_number);

-- Fonction pour générer le numéro de devis
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year integer;
  sequence_number integer;
BEGIN
  -- Obtenir l'année en cours
  current_year := EXTRACT(YEAR FROM NEW.quote_date);
  
  -- Insérer ou mettre à jour la séquence pour l'année
  INSERT INTO quote_sequences (year, last_number)
  VALUES (current_year, 1)
  ON CONFLICT (year) 
  DO UPDATE SET 
    last_number = quote_sequences.last_number + 1,
    updated_at = now()
  RETURNING last_number INTO sequence_number;
  
  -- Assigner le numéro et le numéro formaté
  NEW.number := sequence_number;
  NEW.quote_number := 'DEVIS-' || current_year || '-' || LPAD(sequence_number::text, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour la génération automatique du numéro
CREATE TRIGGER generate_quote_number_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION generate_quote_number();

-- Mettre à jour les devis existants
DO $$
DECLARE
  quote_record RECORD;
  current_year integer;
  sequence_number integer;
BEGIN
  FOR quote_record IN SELECT * FROM quotes WHERE quote_number IS NULL ORDER BY quote_date ASC LOOP
    current_year := EXTRACT(YEAR FROM quote_record.quote_date);
    
    -- Obtenir et incrémenter le numéro de séquence
    INSERT INTO quote_sequences (year, last_number)
    VALUES (current_year, 1)
    ON CONFLICT (year) 
    DO UPDATE SET 
      last_number = quote_sequences.last_number + 1,
      updated_at = now()
    RETURNING last_number INTO sequence_number;
    
    -- Mettre à jour le devis
    UPDATE quotes 
    SET 
      number = sequence_number,
      quote_number = 'DEVIS-' || current_year || '-' || LPAD(sequence_number::text, 4, '0')
    WHERE id = quote_record.id;
  END LOOP;
END $$;