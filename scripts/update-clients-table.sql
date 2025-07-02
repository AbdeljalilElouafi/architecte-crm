-- Add unique constraints for corporate fields
ALTER TABLE clients 
ADD CONSTRAINT rc_unique UNIQUE (rc),
ADD CONSTRAINT ice_unique UNIQUE (ice);

-- Make individual fields nullable since corporate clients won't have them
ALTER TABLE clients 
MODIFY COLUMN firstName VARCHAR(255) NULL,
MODIFY COLUMN lastName VARCHAR(255) NULL,
MODIFY COLUMN cin VARCHAR(255) NULL;
