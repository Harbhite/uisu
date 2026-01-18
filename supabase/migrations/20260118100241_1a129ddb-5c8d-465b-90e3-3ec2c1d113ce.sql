-- Create committees table for governance
CREATE TABLE public.committees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  icon_name TEXT,
  description TEXT,
  chairperson TEXT,
  secretary TEXT,
  mandate TEXT[] DEFAULT '{}',
  members TEXT[] DEFAULT '{}',
  meeting_schedule TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Committees are viewable by everyone"
  ON public.committees FOR SELECT
  USING (true);

CREATE POLICY "Staff can create committees"
  ON public.committees FOR INSERT
  WITH CHECK (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can update committees"
  ON public.committees FOR UPDATE
  USING (is_moderator_or_admin(auth.uid()));

CREATE POLICY "Staff can delete committees"
  ON public.committees FOR DELETE
  USING (is_moderator_or_admin(auth.uid()));

CREATE TRIGGER update_committees_updated_at
  BEFORE UPDATE ON public.committees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.committees (title, slug, type, icon_name, description, chairperson, secretary, mandate, members, meeting_schedule) VALUES
('Finance & Budget Committee', 'finance-budget-committee', 'Legislative', 'Coins', 'Scrutinizes the budget proposals of the Executive Council, monitors spending, and ensures financial transparency.', 'Senator Chairperson', 'Senator Secretary', ARRAY['Review and approve the Union''s annual budget.', 'Monitor financial expenditures of the Executive Council.', 'Ensure adherence to financial bye-laws.', 'Investigate financial discrepancies.'], ARRAY['3 Members from SRC'], 'Meetings are held bi-weekly or as summoned by the Chairperson.'),
('Disciplinary Committee', 'disciplinary-committee', 'Judicial/Legislative', 'Scale', 'Investigates allegations of misconduct, maintains order, and upholds the constitution and code of conduct.', 'Legal Advisor', 'Appointed Secretary', ARRAY['Hear cases of constitutional violations.', 'Recommend sanctions for misconduct.', 'Interpret the Union''s Code of Conduct.', 'Ensure fair hearing for all accused students.'], ARRAY['4 Members appointed by SRC'], 'Meetings are held bi-weekly or as summoned by the Chairperson.'),
('Audit Committee', 'audit-committee', 'Legislative', 'FileText', 'Independently reviews financial records and ensures compliance with financial regulations.', 'Senator Chairperson', 'Appointed Secretary', ARRAY['Audit the Union''s accounts quarterly.', 'Verify receipts and payment vouchers.', 'Report financial anomalies to the House.', 'Publish audited financial reports.'], ARRAY['2 Members from SRC'], 'Meetings are held bi-weekly or as summoned by the Chairperson.'),
('Student Welfare Board', 'student-welfare-board', 'Executive', 'Heart', 'Oversees student accommodation, pricing regulation, and general welfare conditions on campus.', 'House Secretary', 'Appointed Secretary', ARRAY['Monitor prices of goods and services on campus.', 'Liaise with Hall Management on accommodation issues.', 'Manage the Union''s transportation scheme.', 'Address student complaints regarding welfare.'], ARRAY['Welfare Secretaries of Halls'], 'Meetings are held bi-weekly or as summoned by the Chairperson.'),
('Sports Council', 'sports-council', 'Executive', 'Trophy', 'Organizes the SU Cup, Inter-Faculty Games, and promotes sporting activities across the university.', 'Sports Secretary', 'Appointed Secretary', ARRAY['Organize the annual Dean''s Cup and SU Cup.', 'Maintain the Union''s sports equipment.', 'Select and train the University''s sports team.', 'Promote physical fitness campaigns.'], ARRAY['Sports Secretaries of Halls/Faculties'], 'Meetings are held bi-weekly or as summoned by the Chairperson.'),
('Press & Publicity Committee', 'press-publicity-committee', 'Executive', 'Globe', 'Manages the Union''s public relations, press releases, social media, and media presence.', 'Public Relations Officer', 'Appointed Secretary', ARRAY['Manage the Union''s official social media handles.', 'Draft and publish press releases.', 'Organize press conferences.', 'Maintain the Union''s website and notice boards.'], ARRAY['Media Team'], 'Meetings are held bi-weekly or as summoned by the Chairperson.'),
('Academic Committee', 'academic-committee', 'Executive', 'Briefcase', 'Liaises with the university management on academic matters, calendars, and library services.', 'Vice President', 'Appointed Secretary', ARRAY['Represent students in Senate Academic meetings.', 'Organize academic seminars and tutorials.', 'Advocate for better library facilities.', 'Address grading and examination complaints.'], ARRAY['Academic Directors of Faculties'], 'Meetings are held bi-weekly or as summoned by the Chairperson.'),
('Projects & Capital Committee', 'projects-capital-committee', 'Executive/Ad-hoc', 'Building2', 'Oversees the construction, renovation, and maintenance of Union projects and assets.', 'The President', 'The Treasurer', ARRAY['Supervise ongoing Union construction projects.', 'Assess the state of Union properties.', 'Recommend renovation projects.', 'Ensure value for money in capital expenditures.'], ARRAY['House Secretary'], 'Meetings are held bi-weekly or as summoned by the Chairperson.'),
('Health Committee', 'health-committee', 'Executive', 'Activity', 'Ensures the Jaja Clinic serves students effectively, organizes health drives, and promotes health awareness.', 'House Secretary', 'Appointed Secretary', ARRAY['Monitor service delivery at the University Health Service.', 'Organize blood donation and health awareness drives.', 'Manage the Union''s emergency health fund.', 'Liaise with the Director of Health Services.'], ARRAY['Health Representatives'], 'Meetings are held bi-weekly or as summoned by the Chairperson.');