import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';

import '../../core/theme/liriun_tokens.dart';

class LiveCaptureScreen extends StatefulWidget {
  const LiveCaptureScreen({super.key, required this.overlay});
  final Widget overlay;

  @override
  State<LiveCaptureScreen> createState() => _LiveCaptureScreenState();
}

class _LiveCaptureScreenState extends State<LiveCaptureScreen> {
  CameraController? _controller;
  final GlobalKey _captureKey = GlobalKey();
  bool _capturing = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() => _error = 'Nenhuma câmera encontrada.');
        return;
      }
      final back = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );
      _controller = CameraController(
        back,
        ResolutionPreset.high,
        enableAudio: false,
      );
      await _controller!.initialize();
      if (mounted) setState(() {});
    } catch (e) {
      if (mounted) setState(() => _error = 'Falha ao abrir câmera: $e');
    }
  }

  Future<void> _capturar() async {
    if (_capturing) return;
    HapticFeedback.mediumImpact();
    setState(() => _capturing = true);
    try {
      final boundary = _captureKey.currentContext!.findRenderObject()
          as RenderRepaintBoundary;
      final ratio = MediaQuery.of(context).devicePixelRatio;
      final image = await boundary.toImage(pixelRatio: ratio);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;
      final Uint8List bytes = byteData.buffer.asUint8List();
      final dir = await getTemporaryDirectory();
      final file = await File(
              '${dir.path}/liriun-capture-${DateTime.now().millisecondsSinceEpoch}.png')
          .writeAsBytes(bytes);
      if (mounted) Navigator.of(context).pop(file);
    } catch (e) {
      if (mounted) {
        setState(() {
          _capturing = false;
          _error = 'Falha ao capturar: $e';
        });
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (_controller != null && _controller!.value.isInitialized)
              RepaintBoundary(
                key: _captureKey,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Positioned.fill(
                      child: FittedBox(
                        fit: BoxFit.cover,
                        child: SizedBox(
                          width: _controller!.value.previewSize!.height,
                          height: _controller!.value.previewSize!.width,
                          child: CameraPreview(_controller!),
                        ),
                      ),
                    ),
                    Center(child: widget.overlay),
                  ],
                ),
              )
            else if (_error != null)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        color: LiriunColors.danger, fontSize: 14),
                  ),
                ),
              )
            else
              const Center(
                child: CircularProgressIndicator(
                    color: LiriunColors.violet300),
              ),
            Positioned(
              top: 8,
              left: 8,
              child: _RoundBtn(
                icon: Icons.close_rounded,
                onTap: () => Navigator.of(context).pop(),
              ),
            ),
            Positioned(
              bottom: 28,
              left: 0,
              right: 0,
              child: Center(
                child: GestureDetector(
                  onTap: _controller != null &&
                          _controller!.value.isInitialized &&
                          !_capturing
                      ? _capturar
                      : null,
                  child: Container(
                    width: 76,
                    height: 76,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LiriunColors.gradBrand,
                      border:
                          Border.all(color: Colors.white, width: 4),
                      boxShadow: [
                        BoxShadow(
                          color: LiriunColors.violet500
                              .withValues(alpha: 0.50),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: _capturing
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.4,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(
                            Icons.camera_alt_rounded,
                            color: Colors.white,
                            size: 28,
                          ),
                  ),
                ),
              ),
            ),
            const Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Center(
                  child: Text(
                    'Toque pra capturar com o card',
                    style: TextStyle(
                      fontFamily: 'Geist Mono',
                      fontSize: 9,
                      letterSpacing: 1.2,
                      color: Color(0x99FFFFFF),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoundBtn extends StatelessWidget {
  const _RoundBtn({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: const Color(0x66000000),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 18, color: Colors.white),
      ),
    );
  }
}
