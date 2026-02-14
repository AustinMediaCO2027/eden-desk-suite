
ALTER TABLE public.letterheads
  ADD COLUMN recipient_name TEXT DEFAULT '',
  ADD COLUMN recipient_title TEXT DEFAULT '',
  ADD COLUMN recipient_company TEXT DEFAULT '',
  ADD COLUMN recipient_address TEXT DEFAULT '',
  ADD COLUMN recipient_phone TEXT DEFAULT '',
  ADD COLUMN recipient_email TEXT DEFAULT '',
  ADD COLUMN date TEXT DEFAULT '',
  ADD COLUMN subject TEXT DEFAULT '',
  ADD COLUMN closing TEXT DEFAULT 'Sincerely,',
  ADD COLUMN sender_name TEXT DEFAULT '',
  ADD COLUMN sender_title TEXT DEFAULT '';
