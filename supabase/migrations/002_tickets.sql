-- =============================================
-- TICKETING SYSTEM
-- =============================================

-- Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_number SERIAL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- Ticket messages (replies)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name text NOT NULL,
  sender_email text NOT NULL,
  is_admin boolean DEFAULT false,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Updated_at trigger for tickets
CREATE TRIGGER set_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can create a ticket
CREATE POLICY "Anyone can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (true);

-- Users can view own tickets
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Anyone can add message to ticket
CREATE POLICY "Anyone can add ticket messages" ON public.ticket_messages
  FOR INSERT WITH CHECK (true);

-- Users can view messages of own tickets
CREATE POLICY "Users can view own ticket messages" ON public.ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR t.user_id IS NULL)
    )
  );

-- Admins can manage all messages
CREATE POLICY "Admins can manage ticket messages" ON public.ticket_messages
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
