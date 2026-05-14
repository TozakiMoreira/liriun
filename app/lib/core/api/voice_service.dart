import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

/// Service de Speech-to-Text usando engine nativo do Android/iOS.
/// Recognition em pt-BR.
class VoiceService {
  final stt.SpeechToText _engine = stt.SpeechToText();
  bool _ready = false;

  Future<bool> _ensurePermission() async {
    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  Future<bool> initialize() async {
    if (_ready) return true;
    final permOk = await _ensurePermission();
    if (!permOk) return false;
    _ready = await _engine.initialize(
      onStatus: (s) {},
      onError: (e) {},
    );
    return _ready;
  }

  Future<void> startListening({
    required void Function(String transcript, bool finalResult) onResult,
    Duration listenFor = const Duration(seconds: 30),
    Duration pauseFor = const Duration(seconds: 2),
  }) async {
    if (!_ready) {
      final ok = await initialize();
      if (!ok) {
        onResult('', true);
        return;
      }
    }
    await _engine.listen(
      onResult: (result) {
        onResult(result.recognizedWords, result.finalResult);
      },
      localeId: 'pt_BR',
      listenFor: listenFor,
      pauseFor: pauseFor,
      listenOptions: stt.SpeechListenOptions(
        partialResults: true,
        cancelOnError: true,
      ),
    );
  }

  Future<void> stop() async {
    await _engine.stop();
  }

  Future<void> cancel() async {
    await _engine.cancel();
  }

  bool get isListening => _engine.isListening;
  bool get isAvailable => _engine.isAvailable;
}

final voiceServiceProvider = Provider<VoiceService>((ref) => VoiceService());
