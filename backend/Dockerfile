# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files for layer caching
COPY Liriun.slnx ./
COPY src/Liriun.Core/Liriun.Core.csproj src/Liriun.Core/
COPY src/Liriun.Application/Liriun.Application.csproj src/Liriun.Application/
COPY src/Liriun.Infrastructure/Liriun.Infrastructure.csproj src/Liriun.Infrastructure/
COPY src/Liriun.Api/Liriun.Api.csproj src/Liriun.Api/

RUN dotnet restore src/Liriun.Api/Liriun.Api.csproj

# Copy rest of source
COPY src/ src/

RUN dotnet publish src/Liriun.Api/Liriun.Api.csproj \
    -c Release \
    -o /app \
    --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "Liriun.Api.dll"]
