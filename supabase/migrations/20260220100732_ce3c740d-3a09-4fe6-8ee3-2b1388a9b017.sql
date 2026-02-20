
-- Grant admin role to wandilem60@gmail.com (user_id: 7bdfbb56-959d-4e6c-9532-73fc3bc52e87)
INSERT INTO public.user_roles (user_id, role)
VALUES ('7bdfbb56-959d-4e6c-9532-73fc3bc52e87', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
