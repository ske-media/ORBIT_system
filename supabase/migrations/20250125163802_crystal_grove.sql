/*
  # Add tasks table

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamptz)
      - `status` (task_status)
      - `project_id` (uuid, foreign key)
      - `assigned_user_ids` (uuid[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for authenticated users
*/

-- Create task status enum
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  status task_status NOT NULL DEFAULT 'todo',
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_user_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX tasks_project_id_idx ON tasks(project_id);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_due_date_idx ON tasks(due_date);

-- Add trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();