using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Auth;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Auth;

public class LoginUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;

    public LoginUseCase(IUsuarioRepository usuarios, IPasswordHasher hasher, IJwtTokenService jwt)
    {
        _usuarios = usuarios;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AutenticacaoViewModel> ExecutarAsync(LoginInput input, CancellationToken ct = default)
    {
        var usuario = await _usuarios.ObterPorEmailAsync(input.Email, ct);

        if (usuario is null || !_hasher.Verificar(input.Senha, usuario.SenhaHash))
            throw new ApplicationLayerException("Email ou senha inválidos", 401);

        var (token, expira) = _jwt.Gerar(usuario);

        return new AutenticacaoViewModel
        {
            UsuarioId = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Token = token,
            ExpiraEm = expira
        };
    }
}
