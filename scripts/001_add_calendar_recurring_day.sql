ALTER TABLE calendar
  ADD COLUMN recurring_day TINYINT NULL,
  ADD COLUMN ab_day CHAR(1) NULL;
