import 'package:flutter/material.dart';

import '../core/theme/liriun_tokens.dart';

enum Priority { low, medium, high }

enum Category {
  work,
  health,
  home,
  personal,
  finance;

  Color get color {
    switch (this) {
      case Category.work:
        return LiriunColors.catWork;
      case Category.health:
        return LiriunColors.catHealth;
      case Category.home:
        return LiriunColors.catHome;
      case Category.personal:
        return LiriunColors.catPersonal;
      case Category.finance:
        return const Color(0xFFE58FB0);
    }
  }

  String get label {
    switch (this) {
      case Category.work:
        return 'Trabalho';
      case Category.health:
        return 'Saúde';
      case Category.home:
        return 'Casa';
      case Category.personal:
        return 'Pessoal';
      case Category.finance:
        return 'Finanças';
    }
  }
}

class Task {
  const Task({
    required this.id,
    required this.title,
    this.notes,
    required this.createdAt,
    this.scheduledFor,
    this.duration,
    this.completedAt,
    required this.category,
    this.priority,
    this.person,
    this.prepNotes,
    this.isArchived = false,
  });

  final String id;
  final String title;
  final String? notes;
  final DateTime createdAt;
  final DateTime? scheduledFor;
  final Duration? duration;
  final DateTime? completedAt;
  final Category category;
  final Priority? priority;
  final String? person;
  final List<String>? prepNotes;
  final bool isArchived;

  Task copyWith({
    String? title,
    String? notes,
    DateTime? scheduledFor,
    Duration? duration,
    DateTime? completedAt,
    Category? category,
    Priority? priority,
    String? person,
    List<String>? prepNotes,
    bool? isArchived,
  }) {
    return Task(
      id: id,
      title: title ?? this.title,
      notes: notes ?? this.notes,
      createdAt: createdAt,
      scheduledFor: scheduledFor ?? this.scheduledFor,
      duration: duration ?? this.duration,
      completedAt: completedAt ?? this.completedAt,
      category: category ?? this.category,
      priority: priority ?? this.priority,
      person: person ?? this.person,
      prepNotes: prepNotes ?? this.prepNotes,
      isArchived: isArchived ?? this.isArchived,
    );
  }
}
