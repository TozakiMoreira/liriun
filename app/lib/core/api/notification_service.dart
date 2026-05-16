import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class NotificationService {
  NotificationService();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  Future<void> _ensureInit() async {
    if (_initialized) return;
    tz.initializeTimeZones();
    try {
      tz.setLocalLocation(tz.getLocation('America/Sao_Paulo'));
    } catch (_) {}
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    await _plugin.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
    );
    final androidImpl = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await androidImpl?.requestNotificationsPermission();
    await androidImpl?.requestExactAlarmsPermission();
    _initialized = true;
  }

  String _safeIdFromTaskId(String taskId) {
    final hash = taskId.codeUnits.fold<int>(0, (a, b) => (a * 31 + b) & 0x7fffffff);
    return hash.toString();
  }

  Future<void> agendarLembrete({
    required String taskId,
    required String titulo,
    required DateTime quando,
    Duration antecedencia = const Duration(minutes: 15),
  }) async {
    await _ensureInit();
    final fire = quando.subtract(antecedencia);
    if (fire.isBefore(DateTime.now())) return;
    final id = int.parse(_safeIdFromTaskId(taskId));
    await _plugin.zonedSchedule(
      id,
      'Liriun',
      '"$titulo" em ${antecedencia.inMinutes} min.',
      tz.TZDateTime.from(fire, tz.local),
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'liriun_lembretes',
          'Lembretes',
          channelDescription: 'Avisos antes da tarefa começar',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      payload: taskId,
    );
  }

  Future<void> cancelar(String taskId) async {
    await _ensureInit();
    final id = int.parse(_safeIdFromTaskId(taskId));
    await _plugin.cancel(id);
  }
}

final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});
