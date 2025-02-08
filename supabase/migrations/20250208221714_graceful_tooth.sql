-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_project_progress ON tasks;
DROP FUNCTION IF EXISTS calculate_project_progress();

-- Create improved function to calculate project progress
CREATE OR REPLACE FUNCTION calculate_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
  project_id_to_update UUID;
BEGIN
  -- Determine which project_id to use based on operation
  IF TG_OP = 'DELETE' THEN
    project_id_to_update := OLD.project_id;
  ELSE
    project_id_to_update := NEW.project_id;
  END IF;

  -- Get total number of tasks for the project
  SELECT COUNT(*) INTO total_tasks
  FROM tasks
  WHERE project_id = project_id_to_update;

  -- Get number of completed tasks
  SELECT COUNT(*) INTO completed_tasks
  FROM tasks
  WHERE project_id = project_id_to_update
  AND status = 'done';

  -- Calculate new progress (rounded to nearest integer)
  IF total_tasks > 0 THEN
    new_progress := ROUND((completed_tasks::NUMERIC / total_tasks::NUMERIC) * 100);
  ELSE
    new_progress := 0;
  END IF;

  -- Update project progress
  UPDATE projects
  SET 
    progress = new_progress,
    updated_at = now()
  WHERE id = project_id_to_update;

  -- Return appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger that handles all operations
CREATE TRIGGER update_project_progress
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_project_progress();