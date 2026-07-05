# Backend Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the already-passing Backend Core with two independent, additive feature groups — a **Tasks** resource (for the mobile sync bonus) and a **read-through external catalog** (live brands/models from NHTSA vPIC, never persisted) — plus light health/Swagger polish.

**Architecture:** Same 4-layer Clean-lite (`Coderland.*`). New ports live in `Domain`, adapters in `Infrastructure`, orchestration in `Application`, HTTP surface in `Api`. The external catalog is a driven port (`IVehicleMakesProvider`) implemented by a typed, resilient `HttpClient` adapter; it is read-through only (no DB writes, no `Modelo` table). Models are fetched on-demand per brand to avoid an eager fan-out.

**Tech Stack:** .NET 10, EF Core 10 + Npgsql, `Microsoft.Extensions.Http.Resilience` (Polly v8) for the outbound client, XUnit + Moq + coverlet, Swashbuckle.

## Global Constraints

- **.NET 10**, nullable reference types enabled. Root namespace **`Coderland`**.
- New persisted table: **`Tasks`** (PascalCase columns). External brands/models are **read-through only — never persisted**, no `Modelo` entity/table.
- Marcas stay **read-only** (no CRUD added here). DB writes are demonstrated by the **Tasks** resource.
- External source is **NHTSA vPIC** (free, no key): base `https://vpic.nhtsa.dot.gov/api/vehicles/`, `GetMakesForVehicleType/car?format=json` (makes), `GetModelsForMake/{make}?format=json` (models). vPIC is **optional and isolated** — if it fails, the endpoint returns a clean error and the rest of the API is unaffected.
- Tests use **XUnit**; do **not** hit the live vPIC network in tests (use a mocked `HttpMessageHandler`). Keep total line coverage **>= 70%**.
- All code/identifiers/comments in **English**. Commits follow **Conventional Commits**.
- Repo root `d:/Julio/Git/coderland-challenge-backend`; backend under `backend/`, solution `backend/Coderland.sln`.

---

## File Structure

```
backend/src/Coderland.Domain/
  Entities/TaskItem.cs                         (new)
  Repositories/ITaskRepository.cs              (new)
  External/VehicleMake.cs                      (new: record)
  External/VehicleModel.cs                     (new: record)
  External/IVehicleMakesProvider.cs            (new: driven port)
backend/src/Coderland.Application/
  Dtos/TaskItemDto.cs                          (new)
  Dtos/CreateTaskRequest.cs                    (new)
  Dtos/SyncTasksRequest.cs                     (new)
  Dtos/SyncResultDto.cs                        (new)
  Dtos/MarcaExternaDto.cs                      (new)
  Dtos/ModeloExternoDto.cs                     (new)
  Services/ITaskService.cs  Services/TaskService.cs                (new)
  Services/ICatalogoExternoService.cs  Services/CatalogoExternoService.cs   (new)
backend/src/Coderland.Infrastructure/
  Persistence/AppDbContext.cs                  (modify: add DbSet<TaskItem> Tasks)
  Persistence/Configurations/TaskItemConfiguration.cs   (new)
  Persistence/Repositories/TaskRepository.cs   (new)
  External/Vpic/VpicResponses.cs               (new: internal vPIC JSON DTOs)
  External/Vpic/VpicMakesProvider.cs           (new: IVehicleMakesProvider adapter)
  Migrations/*_AddTasks.cs                      (generated)
backend/src/Coderland.Api/
  Controllers/TasksController.cs               (new)
  Controllers/MarcasExternasController.cs      (new)
  Program.cs                                   (modify: register Task + external services, typed HttpClient, split health, XML swagger)
  Coderland.Api.csproj                         (modify: add resilience pkg, GenerateDocumentationFile)
backend/tests/Coderland.UnitTests/
  TaskServiceTests.cs  TasksControllerTests.cs                   (new)
  VpicMakesProviderTests.cs  CatalogoExternoServiceTests.cs  MarcasExternasControllerTests.cs   (new)
backend/tests/Coderland.IntegrationTests/
  TasksEndpointTests.cs                        (new)
```

---

# Feature Group A — Tasks resource

## Task 1: Tasks domain (entity + repository port)

**Files:**
- Create: `backend/src/Coderland.Domain/Entities/TaskItem.cs`
- Create: `backend/src/Coderland.Domain/Repositories/ITaskRepository.cs`

**Interfaces:**
- Produces: `TaskItem { int Id; string Descripcion; DateTime FechaCreacion }`; `ITaskRepository` with `GetAllAsync(CancellationToken)`, `AddAsync(TaskItem, CancellationToken)`, `AddRangeAsync(IEnumerable<TaskItem>, CancellationToken)`.

- [ ] **Step 1: Create the entity**

`backend/src/Coderland.Domain/Entities/TaskItem.cs`:

```csharp
namespace Coderland.Domain.Entities;

/// <summary>A user task (only a description), persisted in the <c>Tasks</c> table.</summary>
public class TaskItem
{
    public int Id { get; set; }

    /// <summary>Task description. Required.</summary>
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>Creation timestamp (UTC).</summary>
    public DateTime FechaCreacion { get; set; }
}
```

- [ ] **Step 2: Create the repository port**

`backend/src/Coderland.Domain/Repositories/ITaskRepository.cs`:

```csharp
using Coderland.Domain.Entities;

namespace Coderland.Domain.Repositories;

/// <summary>Outbound port for reading and writing <see cref="TaskItem"/> aggregates.</summary>
public interface ITaskRepository
{
    Task<IReadOnlyList<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TaskItem> AddAsync(TaskItem item, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TaskItem>> AddRangeAsync(IEnumerable<TaskItem> items, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 3: Build**

Run: `dotnet build backend/src/Coderland.Domain`
Expected: `Build succeeded`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/Coderland.Domain
git commit -m "feat(backend): add TaskItem entity and task repository port"
```

---

## Task 2: Tasks application (DTOs + service, TDD)

**Files:**
- Create: `backend/src/Coderland.Application/Dtos/TaskItemDto.cs`, `CreateTaskRequest.cs`, `SyncTasksRequest.cs`, `SyncResultDto.cs`
- Create: `backend/src/Coderland.Application/Services/ITaskService.cs`, `TaskService.cs`
- Test: `backend/tests/Coderland.UnitTests/TaskServiceTests.cs`

**Interfaces:**
- Consumes: `ITaskRepository`, `TaskItem`.
- Produces:
  - `TaskItemDto(int Id, string Descripcion, DateTime FechaCreacion)`
  - `CreateTaskRequest(string Descripcion)` (Descripcion `[Required]`)
  - `SyncTasksRequest(List<string> Descripciones)`
  - `SyncResultDto(int Imported, int Skipped, IReadOnlyList<TaskItemDto> Tasks)`
  - `ITaskService` with `GetAllAsync(ct)`, `CreateAsync(string descripcion, ct)`, `SyncAsync(IEnumerable<string> descripciones, ct)`.
  - `TaskService` uses a fixed clock injected as `Func<DateTime>`? No — use `DateTime.UtcNow` directly inside the service (tests assert fields other than the exact timestamp).

- [ ] **Step 1: Create the DTOs and interface**

`backend/src/Coderland.Application/Dtos/TaskItemDto.cs`:

```csharp
namespace Coderland.Application.Dtos;

public record TaskItemDto(int Id, string Descripcion, DateTime FechaCreacion);
```

`backend/src/Coderland.Application/Dtos/CreateTaskRequest.cs`:

```csharp
using System.ComponentModel.DataAnnotations;

namespace Coderland.Application.Dtos;

/// <summary>Request body to create a task. Description must not be empty.</summary>
public record CreateTaskRequest([property: Required, MinLength(1)] string Descripcion);
```

`backend/src/Coderland.Application/Dtos/SyncTasksRequest.cs`:

```csharp
namespace Coderland.Application.Dtos;

/// <summary>Bulk push of task descriptions from the mobile client.</summary>
public record SyncTasksRequest(List<string> Descripciones);
```

`backend/src/Coderland.Application/Dtos/SyncResultDto.cs`:

```csharp
namespace Coderland.Application.Dtos;

/// <summary>Outcome of a sync: how many were imported vs. skipped (already present), and the full list.</summary>
public record SyncResultDto(int Imported, int Skipped, IReadOnlyList<TaskItemDto> Tasks);
```

`backend/src/Coderland.Application/Services/ITaskService.cs`:

```csharp
using Coderland.Application.Dtos;

namespace Coderland.Application.Services;

public interface ITaskService
{
    Task<IReadOnlyList<TaskItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TaskItemDto> CreateAsync(string descripcion, CancellationToken cancellationToken = default);
    Task<SyncResultDto> SyncAsync(IEnumerable<string> descripciones, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 2: Write the failing tests**

`backend/tests/Coderland.UnitTests/TaskServiceTests.cs`:

```csharp
using Coderland.Application.Services;
using Coderland.Domain.Entities;
using Coderland.Domain.Repositories;
using Moq;

namespace Coderland.UnitTests;

public class TaskServiceTests
{
    [Fact]
    public async Task CreateAsync_RejectsEmptyDescription()
    {
        var repo = new Mock<ITaskRepository>();
        var sut = new TaskService(repo.Object);

        await Assert.ThrowsAsync<ArgumentException>(() => sut.CreateAsync("   "));
        repo.Verify(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_PersistsAndReturnsDto()
    {
        var repo = new Mock<ITaskRepository>();
        repo.Setup(r => r.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem t, CancellationToken _) => { t.Id = 7; return t; });
        var sut = new TaskService(repo.Object);

        var dto = await sut.CreateAsync("Buy tires");

        Assert.Equal(7, dto.Id);
        Assert.Equal("Buy tires", dto.Descripcion);
    }

    [Fact]
    public async Task SyncAsync_SkipsDuplicatesCaseInsensitively()
    {
        var existing = new List<TaskItem> { new() { Id = 1, Descripcion = "Wash car" } };
        var repo = new Mock<ITaskRepository>();
        repo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(existing);
        repo.Setup(r => r.AddRangeAsync(It.IsAny<IEnumerable<TaskItem>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((IEnumerable<TaskItem> items, CancellationToken _) =>
            {
                var list = items.ToList();
                for (var i = 0; i < list.Count; i++) list[i].Id = 100 + i;
                return list;
            });
        var sut = new TaskService(repo.Object);

        // "wash car" duplicates existing (case-insensitive); "Change oil" is new.
        var result = await sut.SyncAsync(new[] { "wash car", "Change oil" });

        Assert.Equal(1, result.Imported);
        Assert.Equal(1, result.Skipped);
        Assert.Equal(2, result.Tasks.Count); // existing + newly imported
    }
}
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `dotnet test backend/tests/Coderland.UnitTests --filter TaskServiceTests`
Expected: FAIL — `TaskService` does not exist (compile error).

- [ ] **Step 4: Implement the service**

`backend/src/Coderland.Application/Services/TaskService.cs`:

```csharp
using Coderland.Application.Dtos;
using Coderland.Domain.Entities;
using Coderland.Domain.Repositories;

namespace Coderland.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository) =>
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));

    public async Task<IReadOnlyList<TaskItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tasks = await _repository.GetAllAsync(cancellationToken);
        return tasks.Select(ToDto).ToList();
    }

    public async Task<TaskItemDto> CreateAsync(string descripcion, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(descripcion))
            throw new ArgumentException("Description must not be empty.", nameof(descripcion));

        var entity = new TaskItem { Descripcion = descripcion.Trim(), FechaCreacion = DateTime.UtcNow };
        var saved = await _repository.AddAsync(entity, cancellationToken);
        return ToDto(saved);
    }

    public async Task<SyncResultDto> SyncAsync(IEnumerable<string> descripciones, CancellationToken cancellationToken = default)
    {
        var incoming = descripciones
            .Where(d => !string.IsNullOrWhiteSpace(d))
            .Select(d => d.Trim())
            .ToList();

        var existing = await _repository.GetAllAsync(cancellationToken);
        var existingSet = existing.Select(t => t.Descripcion).ToHashSet(StringComparer.OrdinalIgnoreCase);

        var toAdd = incoming
            .Where(d => existingSet.Add(d)) // Add returns false if already present -> dedups incoming too
            .Select(d => new TaskItem { Descripcion = d, FechaCreacion = DateTime.UtcNow })
            .ToList();

        var added = toAdd.Count == 0
            ? (IReadOnlyList<TaskItem>)Array.Empty<TaskItem>()
            : await _repository.AddRangeAsync(toAdd, cancellationToken);

        var skipped = incoming.Count - added.Count;
        var all = existing.Concat(added).Select(ToDto).ToList();
        return new SyncResultDto(added.Count, skipped, all);
    }

    private static TaskItemDto ToDto(TaskItem t) => new(t.Id, t.Descripcion, t.FechaCreacion);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `dotnet test backend/tests/Coderland.UnitTests --filter TaskServiceTests`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add backend/src/Coderland.Application backend/tests/Coderland.UnitTests
git commit -m "feat(backend): add task service with create + dedup sync"
```

---

## Task 3: Tasks infrastructure (config, repository, DbSet, migration)

**Files:**
- Modify: `backend/src/Coderland.Infrastructure/Persistence/AppDbContext.cs`
- Create: `backend/src/Coderland.Infrastructure/Persistence/Configurations/TaskItemConfiguration.cs`
- Create: `backend/src/Coderland.Infrastructure/Persistence/Repositories/TaskRepository.cs`

**Interfaces:**
- Consumes: `TaskItem`, `ITaskRepository`, `AppDbContext`.
- Produces: `AppDbContext.Tasks` (`DbSet<TaskItem>`); `TaskRepository` implementing `ITaskRepository`; an `AddTasks` migration.

- [ ] **Step 1: Add the DbSet**

In `backend/src/Coderland.Infrastructure/Persistence/AppDbContext.cs`, add after the `MarcasAutos` DbSet:

```csharp
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
```

(The `using Coderland.Domain.Entities;` at the top already covers `TaskItem`.)

- [ ] **Step 2: Create the configuration**

`backend/src/Coderland.Infrastructure/Persistence/Configurations/TaskItemConfiguration.cs`:

```csharp
using Coderland.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Coderland.Infrastructure.Persistence.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    private const int MaxDescriptionLength = 500;

    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("Tasks");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Descripcion).IsRequired().HasMaxLength(MaxDescriptionLength);
        builder.Property(t => t.FechaCreacion).IsRequired();
    }
}
```

- [ ] **Step 3: Create the repository**

`backend/src/Coderland.Infrastructure/Persistence/Repositories/TaskRepository.cs`:

```csharp
using Coderland.Domain.Entities;
using Coderland.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Coderland.Infrastructure.Persistence.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context) => _context = context;

    public async Task<IReadOnlyList<TaskItem>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Tasks.AsNoTracking().OrderBy(t => t.Id).ToListAsync(cancellationToken);

    public async Task<TaskItem> AddAsync(TaskItem item, CancellationToken cancellationToken = default)
    {
        _context.Tasks.Add(item);
        await _context.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task<IReadOnlyList<TaskItem>> AddRangeAsync(IEnumerable<TaskItem> items, CancellationToken cancellationToken = default)
    {
        var list = items.ToList();
        _context.Tasks.AddRange(list);
        await _context.SaveChangesAsync(cancellationToken);
        return list;
    }
}
```

- [ ] **Step 4: Build**

Run: `dotnet build backend/src/Coderland.Infrastructure`
Expected: `Build succeeded`.

- [ ] **Step 5: Generate the migration**

From `backend/`:

```bash
dotnet ef migrations add AddTasks --project src/Coderland.Infrastructure --startup-project src/Coderland.Api --output-dir Migrations
```

Expected: a `*_AddTasks.cs` migration creating the `Tasks` table (no seed).

- [ ] **Step 6: Commit**

```bash
git add backend/src/Coderland.Infrastructure
git commit -m "feat(backend): add Tasks table config, repository, and migration"
```

---

## Task 4: Tasks API (controller + DI + tests)

**Files:**
- Create: `backend/src/Coderland.Api/Controllers/TasksController.cs`
- Modify: `backend/src/Coderland.Api/Program.cs` (register `ITaskRepository`, `ITaskService`)
- Test: `backend/tests/Coderland.UnitTests/TasksControllerTests.cs`
- Test: `backend/tests/Coderland.IntegrationTests/TasksEndpointTests.cs`

**Interfaces:**
- Consumes: `ITaskService`, DTOs, `TaskRepository`.
- Produces: `TasksController` with `GET /api/tasks`, `POST /api/tasks`, `POST /api/tasks/sync`.

- [ ] **Step 1: Create the controller**

`backend/src/Coderland.Api/Controllers/TasksController.cs`:

```csharp
using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Coderland.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _service;

    public TasksController(ITaskService service) => _service = service;

    /// <summary>Lists all tasks (used by the mobile client to pull on sync).</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskItemDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _service.GetAllAsync(cancellationToken));

    /// <summary>Creates a single task. Rejects an empty description.</summary>
    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> Create([FromBody] CreateTaskRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var created = await _service.CreateAsync(request.Descripcion, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { }, created);
    }

    /// <summary>Bulk-syncs task descriptions from the mobile client (union by description).</summary>
    [HttpPost("sync")]
    public async Task<ActionResult<SyncResultDto>> Sync([FromBody] SyncTasksRequest request, CancellationToken cancellationToken) =>
        Ok(await _service.SyncAsync(request.Descripciones ?? new List<string>(), cancellationToken));
}
```

- [ ] **Step 2: Register the services in `Program.cs`**

In `backend/src/Coderland.Api/Program.cs`, in the dependency-inversion block (next to the marca registrations), add:

```csharp
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITaskService, TaskService>();
```

Add the needed usings at the top if not present: `using Coderland.Domain.Repositories;` (already present), `using Coderland.Application.Services;` (already present), `using Coderland.Infrastructure.Persistence.Repositories;` (already present).

- [ ] **Step 3: Write the failing controller unit test**

`backend/tests/Coderland.UnitTests/TasksControllerTests.cs`:

```csharp
using Coderland.Api.Controllers;
using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Coderland.UnitTests;

public class TasksControllerTests
{
    [Fact]
    public async Task GetAll_Returns200WithTasks()
    {
        var service = new Mock<ITaskService>();
        service.Setup(s => s.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TaskItemDto> { new(1, "Wash car", DateTime.UtcNow) });
        var sut = new TasksController(service.Object);

        var result = await sut.GetAll(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsAssignableFrom<IReadOnlyList<TaskItemDto>>(ok.Value);
        Assert.Single(payload);
    }

    [Fact]
    public async Task Sync_Returns200WithResult()
    {
        var service = new Mock<ITaskService>();
        service.Setup(s => s.SyncAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SyncResultDto(2, 0, new List<TaskItemDto>()));
        var sut = new TasksController(service.Object);

        var result = await sut.Sync(new SyncTasksRequest(new List<string> { "a", "b" }), CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsType<SyncResultDto>(ok.Value);
        Assert.Equal(2, payload.Imported);
    }
}
```

- [ ] **Step 4: Run unit tests (verify pass after controller compiles)**

Run: `dotnet test backend/tests/Coderland.UnitTests --filter TasksControllerTests`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the integration test (in-memory, real pipeline)**

`backend/tests/Coderland.IntegrationTests/TasksEndpointTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Json;
using Coderland.Application.Dtos;

namespace Coderland.IntegrationTests;

public class TasksEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public TasksEndpointTests(CustomWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Post_Then_Get_ReturnsCreatedTask()
    {
        var client = _factory.CreateClient();

        var post = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest("Rotate tires"));
        Assert.Equal(HttpStatusCode.Created, post.StatusCode);

        var list = await client.GetFromJsonAsync<List<TaskItemDto>>("/api/tasks");
        Assert.NotNull(list);
        Assert.Contains(list!, t => t.Descripcion == "Rotate tires");
    }

    [Fact]
    public async Task Post_EmptyDescription_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var post = await client.PostAsJsonAsync("/api/tasks", new CreateTaskRequest(""));
        Assert.Equal(HttpStatusCode.BadRequest, post.StatusCode);
    }
}
```

Note: the existing `CustomWebApplicationFactory` seeds via `EnsureCreated()`, which builds the schema for ALL configured entities (including `Tasks`), so no change to the factory is required.

- [ ] **Step 6: Run the integration tests**

Run: `dotnet test backend/tests/Coderland.IntegrationTests --filter TasksEndpointTests`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add backend/src/Coderland.Api backend/tests
git commit -m "feat(backend): add Tasks endpoints (list, create, sync) with tests"
```

---

# Feature Group B — External read-through catalog (vPIC)

## Task 5: External domain port + Application service (TDD)

**Files:**
- Create: `backend/src/Coderland.Domain/External/VehicleMake.cs`, `VehicleModel.cs`, `IVehicleMakesProvider.cs`
- Create: `backend/src/Coderland.Application/Dtos/MarcaExternaDto.cs`, `ModeloExternoDto.cs`
- Create: `backend/src/Coderland.Application/Services/ICatalogoExternoService.cs`, `CatalogoExternoService.cs`
- Test: `backend/tests/Coderland.UnitTests/CatalogoExternoServiceTests.cs`

**Interfaces:**
- Produces:
  - `VehicleMake(int Id, string Nombre)`, `VehicleModel(int Id, string Nombre, string Marca)` (records, `Coderland.Domain.External`).
  - `IVehicleMakesProvider` with `GetMakesAsync(CancellationToken)` -> `IReadOnlyList<VehicleMake>` and `GetModelsAsync(string make, CancellationToken)` -> `IReadOnlyList<VehicleModel>`.
  - `MarcaExternaDto(int Id, string Nombre)`, `ModeloExternoDto(int Id, string Nombre, string Marca)`.
  - `ICatalogoExternoService` with `GetMarcasExternasAsync(ct)` and `GetModelosAsync(string marca, ct)`.

- [ ] **Step 1: Create the domain port + value objects**

`backend/src/Coderland.Domain/External/VehicleMake.cs`:

```csharp
namespace Coderland.Domain.External;

/// <summary>A vehicle make (brand) from an external reference source.</summary>
public record VehicleMake(int Id, string Nombre);
```

`backend/src/Coderland.Domain/External/VehicleModel.cs`:

```csharp
namespace Coderland.Domain.External;

/// <summary>A vehicle model belonging to a make, from an external reference source.</summary>
public record VehicleModel(int Id, string Nombre, string Marca);
```

`backend/src/Coderland.Domain/External/IVehicleMakesProvider.cs`:

```csharp
namespace Coderland.Domain.External;

/// <summary>Driven port for a read-only external vehicle catalog (brands + models).</summary>
public interface IVehicleMakesProvider
{
    Task<IReadOnlyList<VehicleMake>> GetMakesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<VehicleModel>> GetModelsAsync(string make, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 2: Create the DTOs + service interface**

`backend/src/Coderland.Application/Dtos/MarcaExternaDto.cs`:

```csharp
namespace Coderland.Application.Dtos;

public record MarcaExternaDto(int Id, string Nombre);
```

`backend/src/Coderland.Application/Dtos/ModeloExternoDto.cs`:

```csharp
namespace Coderland.Application.Dtos;

public record ModeloExternoDto(int Id, string Nombre, string Marca);
```

`backend/src/Coderland.Application/Services/ICatalogoExternoService.cs`:

```csharp
using Coderland.Application.Dtos;

namespace Coderland.Application.Services;

public interface ICatalogoExternoService
{
    Task<IReadOnlyList<MarcaExternaDto>> GetMarcasExternasAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ModeloExternoDto>> GetModelosAsync(string marca, CancellationToken cancellationToken = default);
}
```

- [ ] **Step 3: Write the failing test**

`backend/tests/Coderland.UnitTests/CatalogoExternoServiceTests.cs`:

```csharp
using Coderland.Application.Services;
using Coderland.Domain.External;
using Moq;

namespace Coderland.UnitTests;

public class CatalogoExternoServiceTests
{
    [Fact]
    public async Task GetMarcasExternasAsync_MapsProviderMakesToDtos()
    {
        var provider = new Mock<IVehicleMakesProvider>();
        provider.Setup(p => p.GetMakesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<VehicleMake> { new(448, "TOYOTA") });
        var sut = new CatalogoExternoService(provider.Object);

        var result = await sut.GetMarcasExternasAsync();

        Assert.Single(result);
        Assert.Equal(448, result[0].Id);
        Assert.Equal("TOYOTA", result[0].Nombre);
    }

    [Fact]
    public async Task GetModelosAsync_MapsProviderModelsToDtos()
    {
        var provider = new Mock<IVehicleMakesProvider>();
        provider.Setup(p => p.GetModelsAsync("toyota", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<VehicleModel> { new(2208, "Corolla", "Toyota") });
        var sut = new CatalogoExternoService(provider.Object);

        var result = await sut.GetModelosAsync("toyota");

        Assert.Single(result);
        Assert.Equal("Corolla", result[0].Nombre);
        Assert.Equal("Toyota", result[0].Marca);
    }
}
```

- [ ] **Step 4: Run to verify it fails**

Run: `dotnet test backend/tests/Coderland.UnitTests --filter CatalogoExternoServiceTests`
Expected: FAIL — `CatalogoExternoService` not defined.

- [ ] **Step 5: Implement the service**

`backend/src/Coderland.Application/Services/CatalogoExternoService.cs`:

```csharp
using Coderland.Application.Dtos;
using Coderland.Domain.External;

namespace Coderland.Application.Services;

public class CatalogoExternoService : ICatalogoExternoService
{
    private readonly IVehicleMakesProvider _provider;

    public CatalogoExternoService(IVehicleMakesProvider provider) =>
        _provider = provider ?? throw new ArgumentNullException(nameof(provider));

    public async Task<IReadOnlyList<MarcaExternaDto>> GetMarcasExternasAsync(CancellationToken cancellationToken = default)
    {
        var makes = await _provider.GetMakesAsync(cancellationToken);
        return makes.Select(m => new MarcaExternaDto(m.Id, m.Nombre)).ToList();
    }

    public async Task<IReadOnlyList<ModeloExternoDto>> GetModelosAsync(string marca, CancellationToken cancellationToken = default)
    {
        var models = await _provider.GetModelsAsync(marca, cancellationToken);
        return models.Select(m => new ModeloExternoDto(m.Id, m.Nombre, m.Marca)).ToList();
    }
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `dotnet test backend/tests/Coderland.UnitTests --filter CatalogoExternoServiceTests`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add backend/src/Coderland.Domain backend/src/Coderland.Application backend/tests/Coderland.UnitTests
git commit -m "feat(backend): add external catalog port, DTOs, and service"
```

---

## Task 6: vPIC HTTP adapter (typed client, TDD with mocked handler)

**Files:**
- Create: `backend/src/Coderland.Infrastructure/External/Vpic/VpicResponses.cs`
- Create: `backend/src/Coderland.Infrastructure/External/Vpic/VpicMakesProvider.cs`
- Test: `backend/tests/Coderland.UnitTests/VpicMakesProviderTests.cs`

**Interfaces:**
- Consumes: `IVehicleMakesProvider`, `VehicleMake`, `VehicleModel`.
- Produces: `VpicMakesProvider(HttpClient httpClient)` implementing `IVehicleMakesProvider`, expecting `httpClient.BaseAddress` set to `https://vpic.nhtsa.dot.gov/api/vehicles/`.

- [ ] **Step 1: Create the vPIC JSON response DTOs**

`backend/src/Coderland.Infrastructure/External/Vpic/VpicResponses.cs`:

```csharp
using System.Text.Json.Serialization;

namespace Coderland.Infrastructure.External.Vpic;

// vPIC GetMakesForVehicleType/car -> { "Results": [ { "MakeId": 448, "MakeName": "TOYOTA" } ] }
internal sealed class VpicMakesResponse
{
    [JsonPropertyName("Results")] public List<VpicMake> Results { get; set; } = new();
}

internal sealed class VpicMake
{
    [JsonPropertyName("MakeId")] public int MakeId { get; set; }
    [JsonPropertyName("MakeName")] public string MakeName { get; set; } = string.Empty;
}

// vPIC GetModelsForMake/{make} -> { "Results": [ { "Model_ID": 2208, "Model_Name": "Corolla", "Make_Name": "Toyota" } ] }
internal sealed class VpicModelsResponse
{
    [JsonPropertyName("Results")] public List<VpicModel> Results { get; set; } = new();
}

internal sealed class VpicModel
{
    [JsonPropertyName("Model_ID")] public int ModelId { get; set; }
    [JsonPropertyName("Model_Name")] public string ModelName { get; set; } = string.Empty;
    [JsonPropertyName("Make_Name")] public string MakeName { get; set; } = string.Empty;
}
```

- [ ] **Step 2: Create the provider adapter**

`backend/src/Coderland.Infrastructure/External/Vpic/VpicMakesProvider.cs`:

```csharp
using System.Net.Http.Json;
using Coderland.Domain.External;

namespace Coderland.Infrastructure.External.Vpic;

/// <summary>
/// Read-through adapter over the NHTSA vPIC public API. Never persists; models are
/// fetched on demand per make. Resilience (retry/timeout) is configured on the
/// injected <see cref="HttpClient"/> via the DI registration.
/// </summary>
public class VpicMakesProvider : IVehicleMakesProvider
{
    private readonly HttpClient _http;

    public VpicMakesProvider(HttpClient http) => _http = http;

    public async Task<IReadOnlyList<VehicleMake>> GetMakesAsync(CancellationToken cancellationToken = default)
    {
        var response = await _http.GetFromJsonAsync<VpicMakesResponse>(
            "GetMakesForVehicleType/car?format=json", cancellationToken);

        return response?.Results
            .Select(r => new VehicleMake(r.MakeId, r.MakeName))
            .ToList() ?? new List<VehicleMake>();
    }

    public async Task<IReadOnlyList<VehicleModel>> GetModelsAsync(string make, CancellationToken cancellationToken = default)
    {
        var safeMake = Uri.EscapeDataString(make);
        var response = await _http.GetFromJsonAsync<VpicModelsResponse>(
            $"GetModelsForMake/{safeMake}?format=json", cancellationToken);

        return response?.Results
            .Select(r => new VehicleModel(r.ModelId, r.ModelName, r.MakeName))
            .ToList() ?? new List<VehicleModel>();
    }
}
```

- [ ] **Step 3: Write the failing test (mocked HttpMessageHandler — no network)**

`backend/tests/Coderland.UnitTests/VpicMakesProviderTests.cs`:

```csharp
using System.Net;
using System.Text;
using Coderland.Infrastructure.External.Vpic;

namespace Coderland.UnitTests;

public class VpicMakesProviderTests
{
    private static HttpClient ClientReturning(string json)
    {
        var handler = new StubHandler(json);
        return new HttpClient(handler) { BaseAddress = new Uri("https://vpic.nhtsa.dot.gov/api/vehicles/") };
    }

    [Fact]
    public async Task GetMakesAsync_ParsesAndMapsResults()
    {
        const string json = """
        {"Count":2,"Results":[{"MakeId":448,"MakeName":"TOYOTA"},{"MakeId":449,"MakeName":"HONDA"}]}
        """;
        var sut = new VpicMakesProvider(ClientReturning(json));

        var makes = await sut.GetMakesAsync();

        Assert.Equal(2, makes.Count);
        Assert.Equal(448, makes[0].Id);
        Assert.Equal("TOYOTA", makes[0].Nombre);
    }

    [Fact]
    public async Task GetModelsAsync_ParsesUnderscoreFieldsAndMaps()
    {
        const string json = """
        {"Count":1,"Results":[{"Make_ID":448,"Make_Name":"Toyota","Model_ID":2208,"Model_Name":"Corolla"}]}
        """;
        var sut = new VpicMakesProvider(ClientReturning(json));

        var models = await sut.GetModelsAsync("toyota");

        Assert.Single(models);
        Assert.Equal(2208, models[0].Id);
        Assert.Equal("Corolla", models[0].Nombre);
        Assert.Equal("Toyota", models[0].Marca);
    }

    private sealed class StubHandler : HttpMessageHandler
    {
        private readonly string _json;
        public StubHandler(string json) => _json = json;

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(_json, Encoding.UTF8, "application/json")
            });
    }
}
```

- [ ] **Step 4: Run to verify it fails, then (after Step 1-2 compile) passes**

Run: `dotnet test backend/tests/Coderland.UnitTests --filter VpicMakesProviderTests`
Expected: FAIL before the provider exists (compile error); PASS once Steps 1-2 are in place (2 tests).

- [ ] **Step 5: Commit**

```bash
git add backend/src/Coderland.Infrastructure backend/tests/Coderland.UnitTests
git commit -m "feat(backend): add vPIC read-through HTTP adapter with parsing tests"
```

---

## Task 7: External API endpoints + resilient client registration

**Files:**
- Create: `backend/src/Coderland.Api/Controllers/MarcasExternasController.cs`
- Modify: `backend/src/Coderland.Api/Program.cs` (typed HttpClient + resilience, register `ICatalogoExternoService`)
- Modify: `backend/src/Coderland.Api/Coderland.Api.csproj` (add `Microsoft.Extensions.Http.Resilience`)
- Test: `backend/tests/Coderland.UnitTests/MarcasExternasControllerTests.cs`

**Interfaces:**
- Consumes: `ICatalogoExternoService`, `IVehicleMakesProvider`, `VpicMakesProvider`, DTOs.
- Produces: `MarcasExternasController` with `GET /api/marcas/externas` and `GET /api/marcas/externas/{marca}/modelos`.

- [ ] **Step 1: Add the resilience package**

Run: `dotnet add backend/src/Coderland.Api package Microsoft.Extensions.Http.Resilience`

- [ ] **Step 2: Create the controller**

`backend/src/Coderland.Api/Controllers/MarcasExternasController.cs`:

```csharp
using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Coderland.Api.Controllers;

[ApiController]
[Route("api/marcas/externas")]
public class MarcasExternasController : ControllerBase
{
    private readonly ICatalogoExternoService _service;

    public MarcasExternasController(ICatalogoExternoService service) => _service = service;

    /// <summary>Live car brands from the external NHTSA vPIC source (read-through, not persisted).</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MarcaExternaDto>>> GetMarcas(CancellationToken cancellationToken) =>
        Ok(await _service.GetMarcasExternasAsync(cancellationToken));

    /// <summary>Live models for one brand, fetched on demand (read-through, not persisted).</summary>
    [HttpGet("{marca}/modelos")]
    public async Task<ActionResult<IReadOnlyList<ModeloExternoDto>>> GetModelos(string marca, CancellationToken cancellationToken) =>
        Ok(await _service.GetModelosAsync(marca, cancellationToken));
}
```

- [ ] **Step 3: Register the typed client + service in `Program.cs`**

In `backend/src/Coderland.Api/Program.cs`, after the existing service registrations, add:

```csharp
// External read-through catalog (NHTSA vPIC) — typed client with standard resilience.
builder.Services.AddHttpClient<IVehicleMakesProvider, VpicMakesProvider>(client =>
{
    client.BaseAddress = new Uri("https://vpic.nhtsa.dot.gov/api/vehicles/");
    client.Timeout = TimeSpan.FromSeconds(15);
})
.AddStandardResilienceHandler();

builder.Services.AddScoped<ICatalogoExternoService, CatalogoExternoService>();
```

Add usings at the top: `using Coderland.Domain.External;` and `using Coderland.Infrastructure.External.Vpic;` (and `using Coderland.Application.Services;` already present).

- [ ] **Step 4: Write the failing controller unit test**

`backend/tests/Coderland.UnitTests/MarcasExternasControllerTests.cs`:

```csharp
using Coderland.Api.Controllers;
using Coderland.Application.Dtos;
using Coderland.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Coderland.UnitTests;

public class MarcasExternasControllerTests
{
    [Fact]
    public async Task GetMarcas_Returns200WithExternalBrands()
    {
        var service = new Mock<ICatalogoExternoService>();
        service.Setup(s => s.GetMarcasExternasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MarcaExternaDto> { new(448, "TOYOTA") });
        var sut = new MarcasExternasController(service.Object);

        var result = await sut.GetMarcas(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsAssignableFrom<IReadOnlyList<MarcaExternaDto>>(ok.Value);
        Assert.Single(payload);
    }

    [Fact]
    public async Task GetModelos_Returns200WithModels()
    {
        var service = new Mock<ICatalogoExternoService>();
        service.Setup(s => s.GetModelosAsync("toyota", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ModeloExternoDto> { new(2208, "Corolla", "Toyota") });
        var sut = new MarcasExternasController(service.Object);

        var result = await sut.GetModelos("toyota", CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var payload = Assert.IsAssignableFrom<IReadOnlyList<ModeloExternoDto>>(ok.Value);
        Assert.Single(payload);
    }
}
```

- [ ] **Step 5: Run unit tests + full build**

Run: `dotnet test backend/tests/Coderland.UnitTests --filter MarcasExternasControllerTests`
Expected: PASS (2 tests). Then `dotnet build backend/Coderland.sln` — 0 warnings, 0 errors.

- [ ] **Step 6: Commit**

```bash
git add backend/src/Coderland.Api backend/tests/Coderland.UnitTests
git commit -m "feat(backend): add external catalog endpoints with resilient vPIC client"
```

---

## Task 8: Health split + Swagger XML docs (polish)

**Files:**
- Modify: `backend/src/Coderland.Api/Program.cs` (tag DB check `ready`, add `self` liveness, map `/health/live` + `/health/ready`)
- Modify: `backend/src/Coderland.Api/Coderland.Api.csproj` (enable XML doc file)
- Modify: `backend/src/Coderland.Api/Program.cs` (Swagger includes XML comments)

**Interfaces:**
- Consumes: existing health + Swagger setup.
- Produces: `/health` (overall), `/health/live` (liveness, no DB), `/health/ready` (DB readiness); Swagger UI shows the controller XML summaries.

- [ ] **Step 1: Enable XML documentation generation**

In `backend/src/Coderland.Api/Coderland.Api.csproj`, inside the main `<PropertyGroup>`, add:

```xml
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <NoWarn>$(NoWarn);CS1591</NoWarn>
```

(`CS1591` silences "missing XML comment" for undocumented public members — we document controllers, not every DTO.)

- [ ] **Step 2: Update health + Swagger wiring in `Program.cs`**

Replace the health-check registration line with a tagged version:

```csharp
builder.Services.AddHealthChecks()
    .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy(), tags: new[] { "live" })
    .AddNpgSql(connectionString, name: "postgres", tags: new[] { "ready" });
```

Replace `builder.Services.AddSwaggerGen();` with:

```csharp
builder.Services.AddSwaggerGen(options =>
{
    var xml = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xml);
    if (File.Exists(xmlPath)) options.IncludeXmlComments(xmlPath);
});
```

Replace `app.MapHealthChecks("/health");` with:

```csharp
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
```

- [ ] **Step 3: Build + run the full suite**

Run: `dotnet build backend/Coderland.sln` (0 warnings) then `dotnet test backend/Coderland.sln`
Expected: build clean; ALL tests pass (existing + new Task/external tests).

- [ ] **Step 4: Verify coverage still >= 70%**

Run from `backend/`:

```bash
dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults --settings coverlet.runsettings
reportgenerator -reports:"./TestResults/**/coverage.cobertura.xml" -targetdir:"./TestResults/report" -reporttypes:"TextSummary"
```

Confirm line coverage >= 70% in `./TestResults/report/Summary.txt`. If below, add a service edge-case test (e.g., `TaskService.GetAllAsync` returns empty; `CatalogoExternoService` empty provider result).

- [ ] **Step 5: Commit**

```bash
git add backend/src/Coderland.Api
git commit -m "feat(backend): split health into live/ready and include XML docs in Swagger"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** Tasks resource — GET/POST/sync (Tasks 1-4); external read-through catalog — `/api/marcas/externas` + `/{marca}/modelos` (Tasks 5-7), read-through only, on-demand models, resilient + isolated client; health enrichment + Swagger docs (Task 8). Matches the design spec's Backend-Polish + External-catalog tiers.
- **No persistence of external data:** confirmed — no `Modelo` entity, no migration for external data; vPIC DTOs are `internal` to Infrastructure.
- **Marcas stay read-only:** no CRUD added to `MarcasAutosController`.
- **No network in tests:** the vPIC provider is tested with a stub `HttpMessageHandler`; the service and controllers are tested with mocks.
- **Type consistency:** `VehicleMake(int Id, string Nombre)`, `VehicleModel(int Id, string Nombre, string Marca)`, `MarcaExternaDto(int Id, string Nombre)`, `ModeloExternoDto(int Id, string Nombre, string Marca)`, `ITaskService`/`ICatalogoExternoService` signatures, and the vPIC JSON field names (`MakeId`/`MakeName`, `Model_ID`/`Model_Name`/`Make_Name`) are consistent across tasks and match the live vPIC response shapes verified against the API.
- **Independence:** Feature Group A (Tasks) and Feature Group B (External) share no state and can be executed/stopped independently; each ends with passing tests.
```
