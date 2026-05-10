import "package:dio/dio.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:flutter_secure_storage/flutter_secure_storage.dart";
import "package:pretty_dio_logger/pretty_dio_logger.dart";

/// Base URL do backend .NET. Passada via --dart-define em build/run.
/// Ex: --dart-define=API_BASE_URL=http://10.0.2.2:5000  (Android emulador)
///     --dart-define=API_BASE_URL=https://api.liriun.com
const apiBaseUrl = String.fromEnvironment("API_BASE_URL");

/// Storage seguro pro JWT (Keychain iOS / EncryptedSharedPreferences Android).
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
});

/// Provider do Dio com baseUrl + interceptors de auth + log.
final dioProvider = Provider<Dio>((ref) {
  if (apiBaseUrl.isEmpty) {
    throw StateError(
      "API_BASE_URL não definida. Passe via --dart-define=API_BASE_URL=...",
    );
  }

  final storage = ref.read(secureStorageProvider);

  final dio = Dio(BaseOptions(
    baseUrl: apiBaseUrl,
    connectTimeout: const Duration(seconds: 12),
    receiveTimeout: const Duration(seconds: 30),
    sendTimeout: const Duration(seconds: 30),
    contentType: "application/json",
    responseType: ResponseType.json,
  ));

  dio.interceptors.add(_AuthInterceptor(storage));
  dio.interceptors.add(PrettyDioLogger(
    requestHeader: false,
    requestBody: true,
    responseBody: false,
    error: true,
    compact: true,
  ));

  return dio;
});

class _AuthInterceptor extends Interceptor {
  _AuthInterceptor(this._storage);

  static const _tokenKey = "liriun.jwt";

  final FlutterSecureStorage _storage;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.read(key: _tokenKey);
    if (token != null && token.isNotEmpty) {
      options.headers["Authorization"] = "Bearer $token";
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token inválido/expirado: limpa storage. Provider de sessão observa e força login.
      await _storage.delete(key: _tokenKey);
    }
    handler.next(err);
  }
}

/// Helpers expostos pra controllers que precisam ler/escrever o JWT.
extension JwtStorage on FlutterSecureStorage {
  static const _key = "liriun.jwt";

  Future<String?> readJwt() => read(key: _key);
  Future<void> writeJwt(String token) => write(key: _key, value: token);
  Future<void> clearJwt() => delete(key: _key);
}
