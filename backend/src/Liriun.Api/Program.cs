using System.Text;
using Liriun.Api.Auth;
using Liriun.Api.Middlewares;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.IoC;
using Liriun.Infrastructure.IoC;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Liriun API",
        Version = "v1",
        Description = "Organizador pessoal de tarefas. Use /auth/cadastro ou /auth/login pra obter um token, depois clique em Authorize e cole o JWT."
    });

    opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Cole apenas o token JWT (sem o prefixo 'Bearer ')."
    });

    opt.AddSecurityRequirement(doc =>
    {
        OpenApiSecurityRequirement req = new();
        req[new OpenApiSecuritySchemeReference("Bearer", doc, null)] = new List<string>();
        return req;
    });
});

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUsuarioLogado, UsuarioLogadoContext>();

string jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret não configurada");
string? jwtIssuer = builder.Configuration["Jwt:Issuer"];
string? jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

const string CorsFront = "FrontDev";
builder.Services.AddCors(opt =>
{
    opt.AddPolicy(CorsFront, policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(opt =>
    {
        opt.SwaggerEndpoint("/swagger/v1/swagger.json", "Liriun API v1");
        opt.RoutePrefix = "swagger";
        opt.DocumentTitle = "Liriun API";
    });
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors(CorsFront);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
