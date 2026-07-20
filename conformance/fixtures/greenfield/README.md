# csv-normalize

Build a Bun CLI that reads a CSV file and writes rows with trimmed fields in their original order.

The first vertical must define and prove the CLI contract before implementation. Empty input produces an empty output file. A malformed row exits with code 2 and leaves an existing output file byte-identical. No network, accounts, database, cloud service, plugin system, or production dependency belongs in the project.
