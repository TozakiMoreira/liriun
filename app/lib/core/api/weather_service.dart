import 'dart:developer' as developer;

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

class WeatherSnapshot {
  WeatherSnapshot({required this.label, required this.temperature});
  final String label;
  final double? temperature;
}

class WeatherService {
  WeatherService();

  Future<Position?> _position() async {
    try {
      final svc = await Geolocator.isLocationServiceEnabled();
      developer.log('[weather] location service: $svc', name: 'liriun');
      if (!svc) return null;
      var perm = await Geolocator.checkPermission();
      developer.log('[weather] perm: $perm', name: 'liriun');
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
        developer.log('[weather] perm after request: $perm', name: 'liriun');
      }
      if (perm == LocationPermission.denied ||
          perm == LocationPermission.deniedForever) {
        return null;
      }
      try {
        final last = await Geolocator.getLastKnownPosition();
        if (last != null) {
          developer.log(
              '[weather] last known: ${last.latitude},${last.longitude}',
              name: 'liriun');
          return last;
        }
      } catch (e) {
        developer.log('[weather] last known err: $e', name: 'liriun');
      }
      final p = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.low,
          timeLimit: Duration(seconds: 15),
        ),
      );
      developer.log('[weather] current: ${p.latitude},${p.longitude}',
          name: 'liriun');
      return p;
    } catch (e) {
      developer.log('[weather] position err: $e', name: 'liriun');
      return null;
    }
  }

  String _labelFromCode(int code) {
    if (code == 0) return 'ENSOLARADO';
    if (code <= 2) return 'POUCAS NUVENS';
    if (code == 3) return 'NUBLADO';
    if (code <= 48) return 'NEBLINA';
    if (code <= 57) return 'GAROA';
    if (code <= 67) return 'CHUVA';
    if (code <= 77) return 'NEVE';
    if (code <= 82) return 'PANCADAS';
    if (code <= 86) return 'NEVE FORTE';
    return 'TEMPESTADE';
  }

  Future<WeatherSnapshot?> current() async {
    final prefs = await SharedPreferences.getInstance();
    final cachedAt = prefs.getInt('weather_at') ?? 0;
    final agora = DateTime.now().millisecondsSinceEpoch;
    if (agora - cachedAt < 30 * 60 * 1000) {
      final label = prefs.getString('weather_label');
      final temp = prefs.getDouble('weather_temp');
      if (label != null) return WeatherSnapshot(label: label, temperature: temp);
    }
    final pos = await _position();
    if (pos == null) {
      developer.log('[weather] no position, abort', name: 'liriun');
      return null;
    }
    try {
      final dio = Dio(BaseOptions(
        baseUrl: 'https://api.open-meteo.com',
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ));
      developer.log(
          '[weather] calling Open-Meteo for ${pos.latitude},${pos.longitude}',
          name: 'liriun');
      final res = await dio.get<Map<String, dynamic>>('/v1/forecast', queryParameters: {
        'latitude': pos.latitude,
        'longitude': pos.longitude,
        'current_weather': true,
      });
      developer.log('[weather] api response: ${res.data}', name: 'liriun');
      final cw = res.data?['current_weather'] as Map<String, dynamic>?;
      if (cw == null) return null;
      final code = cw['weathercode'] as int? ?? 0;
      final temp = (cw['temperature'] as num?)?.toDouble();
      final label = _labelFromCode(code);
      developer.log('[weather] resolved: $label ($temp°)', name: 'liriun');
      await prefs.setString('weather_label', label);
      if (temp != null) await prefs.setDouble('weather_temp', temp);
      await prefs.setInt('weather_at', agora);
      return WeatherSnapshot(label: label, temperature: temp);
    } catch (e) {
      developer.log('[weather] api err: $e', name: 'liriun');
      return null;
    }
  }
}

final weatherServiceProvider = Provider<WeatherService>((ref) {
  return WeatherService();
});

final weatherProvider = FutureProvider<WeatherSnapshot?>((ref) async {
  return ref.read(weatherServiceProvider).current();
});
