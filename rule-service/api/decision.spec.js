// Decsion - Test cases

// Invalid checkpoint
{
    "checkpoint_id": 8,
    "entity_id": 1
}

// No Rules
{
	"checkpoint_id": 1,
	"entity_id": 4
}

// Entry to CP-3 if CP-2 is done
{
	"checkpoint_id": 3,
	"entity_id": 2
}

// No Entry to CP-4 if CP-3 is not done
{
	"checkpoint_id": 4,
	"entity_id": 2
}

// Round trip condition
{
	"checkpoint_id": 2,
	"entity_id": 1
}

