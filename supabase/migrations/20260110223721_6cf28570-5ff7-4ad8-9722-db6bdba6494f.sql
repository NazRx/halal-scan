-- Allow admins to view all profiles for user management
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (is_admin(auth.uid()));

-- Allow admins to view all usage events for analytics
CREATE POLICY "Admins can view all usage events" ON usage_events
FOR SELECT USING (is_admin(auth.uid()));

-- Allow admins to view all review requests
CREATE POLICY "Admins can view all review requests" ON review_requests
FOR SELECT USING (is_admin(auth.uid()));