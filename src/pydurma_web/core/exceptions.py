class CollationError(Exception):
    """Raised when collation fails due to invalid input or processing errors."""


class WitnessValidationError(CollationError):
    """Raised when witness names or file inputs are invalid."""
