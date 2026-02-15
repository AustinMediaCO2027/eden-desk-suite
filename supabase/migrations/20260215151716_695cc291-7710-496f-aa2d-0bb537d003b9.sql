
ALTER TABLE public.tasks DROP CONSTRAINT tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK (status = ANY (ARRAY['pending', 'completed', 'not_started', 'in_progress', 'overdue', 'cancelled']));
