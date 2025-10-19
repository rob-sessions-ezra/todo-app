using Xunit;

// Disable parallelization to avoid cross-test interference with the in-memory DB and hosted server.
[assembly: CollectionBehavior(DisableTestParallelization = true)]
