using Jarvis.Application.InputModels.Auth;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.ViewModels.Auth;
using Jarvis.Core.Entities;
using Jarvis.Core.Exceptions;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Auth;

public class CadastrarUsuarioUseCase
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;

    public CadastrarUsuarioUseCase(IUsuarioRepository usuarios, IPasswordHasher hasher, IJwtTokenService jwt)
    {
        _usuarios = usuarios;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AutenticacaoViewModel> ExecutarAsync(CadastrarUsuarioInput input, CancellationToken ct = default)
    {
        if (await _usuarios.ExisteEmailAsync(input.Email, ct))
            throw new ApplicationLayerException("Já existe um usuário com esse email", 409);

        var senhaHash = _hasher.Hash(input.Senha);
        var usuario = new Usuario(input.Nome, input.Email, senhaHash);

        await _usuarios.AdicionarAsync(usuario, ct);

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
