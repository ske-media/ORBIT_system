-- Create function to calculate project progress
CREATE OR REPLACE FUNCTION calculate_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress INTEGER;
BEGIN
  -- Get total number of tasks for the project
  SELECT COUNT(*) INTO total_tasks
  FROM tasks
  WHERE project_id = NEW.project_id;

  -- Get number of completed tasks
  SELECT COUNT(*) INTO completed_tasks
  FROM tasks
  WHERE project_id = NEW.project_id
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
  WHERE id = NEW.project_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update progress when tasks are modified
DROP TRIGGER IF EXISTS update_project_progress ON tasks;
CREATE TRIGGER update_project_progress
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_project_progress();