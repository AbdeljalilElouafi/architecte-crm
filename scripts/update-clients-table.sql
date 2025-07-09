-- Add unique constraints for corporate fields
ALTER TABLE clients 
ADD CONSTRAINT rc_unique UNIQUE (rc),
ADD CONSTRAINT ice_unique UNIQUE (ice);

-- Make individual fields nullable since corporate clients won't have them
ALTER TABLE clients 
MODIFY COLUMN firstName VARCHAR(255) NULL,
MODIFY COLUMN lastName VARCHAR(255) NULL,
MODIFY COLUMN cin VARCHAR(255) NULL;


-- Add manager fields to the clients table
ALTER TABLE clients 
ADD COLUMN managerName VARCHAR(255) NULL AFTER headquarters,
ADD COLUMN managerCIN VARCHAR(255) NULL AFTER managerName,
ADD COLUMN managerPhone VARCHAR(255) NULL AFTER managerCIN;

-- Add unique constraint for manager CIN
ALTER TABLE clients 
ADD CONSTRAINT manager_cin_unique UNIQUE (managerCIN);
