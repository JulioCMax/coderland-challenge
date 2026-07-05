# --- Build stage ---
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution + project files first so `restore` is cached independently of source changes.
COPY Coderland.sln ./
COPY src/Coderland.Domain/Coderland.Domain.csproj src/Coderland.Domain/
COPY src/Coderland.Application/Coderland.Application.csproj src/Coderland.Application/
COPY src/Coderland.Infrastructure/Coderland.Infrastructure.csproj src/Coderland.Infrastructure/
COPY src/Coderland.Api/Coderland.Api.csproj src/Coderland.Api/
COPY tests/Coderland.UnitTests/Coderland.UnitTests.csproj tests/Coderland.UnitTests/
COPY tests/Coderland.IntegrationTests/Coderland.IntegrationTests.csproj tests/Coderland.IntegrationTests/
RUN dotnet restore Coderland.sln

# Copy the rest of the source and publish (no second restore).
COPY . .
RUN dotnet publish src/Coderland.Api/Coderland.Api.csproj -c Release -o /app/publish --no-restore

# --- Runtime stage ---
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
# Run as the non-root user provided by the .NET base image.
USER $APP_UID
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Coderland.Api.dll"]
