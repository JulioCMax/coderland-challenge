# ADR-0002: Naming across boundaries

## Status

Accepted

## Context

The product is named **Coderland**, so the solution, projects, and namespaces are
`Coderland.*`. Independently, the backend challenge PDF **mandates** two concrete
artifact names that do not follow that product name:

- the database table **`MarcasAutos`**, and
- the controller class **`MarcasAutosController`**.

The public endpoint is `/api/marcas`. This mismatch between the product name and
the mandated artifact names is easy to overlook, and it caused rework twice during
implementation — hence this record, so the rule is unambiguous.

## Decision

- Solution, projects, and namespaces use the product prefix `Coderland.*`.
- The mandated names are honored exactly: the table is `MarcasAutos` and the
  controller class is `MarcasAutosController`.
- To keep the schema consistent with the mandated table name, **tables and columns
  are PascalCase** (`MarcasAutos`, `Tasks`, `Nombre`, `PaisOrigen`, `Descripcion`,
  `FechaCreacion`).
- **Domain field names are Spanish** by established convention: `Nombre`,
  `PaisOrigen`, `Descripcion`, `Marca`.
- **JSON is camelCase** across the wire: `nombre`, `paisOrigen`, `fechaCreacion`.
- The database name is `coderland`.

## Consequences

- The mandated grading artifacts (`MarcasAutos`, `MarcasAutosController`,
  `/api/marcas`) are satisfied without renaming the product.
- One casing rule (PascalCase) applies to the whole schema, so there is no
  per-table exception to remember.
- Trade-off: PascalCase identifiers in PostgreSQL are not the ecosystem default and
  can require quoting in hand-written SQL. Accepted to honor the mandated table name.

### Alternatives considered

- **snake_case tables and columns** — the greenfield preference and the PostgreSQL
  convention. Rejected because the mandated table name `MarcasAutos` is PascalCase;
  mixing conventions in one schema was judged worse than adopting PascalCase
  throughout.
