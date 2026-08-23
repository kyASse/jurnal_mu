# DOI Subscription Module 5 Implementation Plan: Background Scheduler & Notifikasi Email / In-App

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun otomatisasi background scheduler dan notifikasi transaksional (Email Markdown & Database In-App) untuk siklus hidup langganan DOI: evaluasi masa berlaku (grace period & expired), pengingat jatuh tempo faktur, notifikasi upload bukti bayar ke Super Admin, serta notifikasi hasil verifikasi (persetujuan/penolakan) ke institusi/pengelola jurnal.

**Architecture:** Console Commands (`CheckExpiringDoiSubscriptionsCommand`, `SendInvoiceDueReminderCommand`) terdaftar di `routes/console.php`. Event Listeners (`SendPaymentProofUploadedNotification`, `SendSubscriptionActivatedNotification`, `SendPaymentProofRejectedNotification`) menangkap domain event DOI dan mengirim notifikasi via channel `mail` + `database` secara asinkron (`ShouldQueue`).

**Tech Stack:** Laravel 12 + Notification System (Mail Markdown & Database Channel) + Event-Driven Architecture + PHPUnit.

---

### Task 1: Notifications & Event Listeners

**Files:**
- Create: `app/Notifications/Doi/DoiPaymentProofUploadedNotification.php`
- Create: `app/Notifications/Doi/DoiSubscriptionActivatedNotification.php`
- Create: `app/Notifications/Doi/DoiPaymentProofRejectedNotification.php`
- Create: `app/Notifications/Doi/DoiInvoiceDueReminderNotification.php`
- Create: `app/Notifications/Doi/DoiSubscriptionStatusChangedNotification.php`
- Create: `app/Listeners/Doi/SendPaymentProofUploadedNotification.php`
- Create: `app/Listeners/Doi/SendSubscriptionActivatedNotification.php`
- Create: `app/Listeners/Doi/SendPaymentProofRejectedNotification.php`
- Modify: `app/Providers/AppServiceProvider.php`
- Test: `tests/Feature/Doi/DoiSchedulerAndNotificationTest.php`

- [ ] **Step 1: Write the failing feature test for Event Listeners & Notifications**

Create `tests/Feature/Doi/DoiSchedulerAndNotificationTest.php` with initial test cases:
1. `test_payment_proof_uploaded_event_triggers_super_admin_notification`: Assert listener dispatches `DoiPaymentProofUploadedNotification` to all Super Admins.
2. `test_subscription_activated_event_triggers_user_notification`: Assert listener dispatches `DoiSubscriptionActivatedNotification` to user.
3. `test_payment_proof_rejected_event_triggers_user_rejection_notification`: Assert listener dispatches `DoiPaymentProofRejectedNotification` with `admin_notes` to user.

- [ ] **Step 2: Run test to verify failure**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiSchedulerAndNotificationTest.php`
Expected: FAIL (Listeners and notification classes not implemented yet).

- [ ] **Step 3: Implement 5 Notification Classes**

Implement `DoiPaymentProofUploadedNotification`, `DoiSubscriptionActivatedNotification`, `DoiPaymentProofRejectedNotification`, `DoiInvoiceDueReminderNotification`, and `DoiSubscriptionStatusChangedNotification` with `ShouldQueue`, `via(): ['mail', 'database']`, custom Markdown mail representations, and structured database payloads.

- [ ] **Step 4: Implement 3 Event Listeners & Bind in `AppServiceProvider.php`**

Implement `SendPaymentProofUploadedNotification`, `SendSubscriptionActivatedNotification`, `SendPaymentProofRejectedNotification` and bind them with `Event::listen` in `AppServiceProvider.php`.

- [ ] **Step 5: Run test to verify it passes**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiSchedulerAndNotificationTest.php`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Notifications/Doi/ app/Listeners/Doi/ app/Providers/AppServiceProvider.php tests/Feature/Doi/DoiSchedulerAndNotificationTest.php
git commit -m "feat(doi): implement notifications, event listeners, and service provider bindings"
```

---

### Task 2: Console Commands & Background Scheduler

**Files:**
- Create: `app/Console/Commands/Doi/CheckExpiringDoiSubscriptionsCommand.php`
- Create: `app/Console/Commands/Doi/SendInvoiceDueReminderCommand.php`
- Modify: `routes/console.php`
- Test: `tests/Feature/Doi/DoiSchedulerAndNotificationTest.php`

- [ ] **Step 1: Extend `DoiSchedulerAndNotificationTest.php` with Console Command tests**

Add test cases:
1. `test_check_expiring_subscriptions_command_transitions_active_to_grace_period`: Assert `status` becomes `GRACE_PERIOD` when `end_date` is in past 7 days, and `DoiSubscriptionStatusChangedNotification` is sent.
2. `test_check_expiring_subscriptions_command_transitions_grace_period_to_expired_after_7_days`: Assert `status` becomes `EXPIRED` when `end_date < now()->subDays(7)`, and `DoiSubscriptionStatusChangedNotification` is sent.
3. `test_send_invoice_due_reminder_command_sends_notification_for_unpaid_invoices`: Assert `DoiInvoiceDueReminderNotification` is sent for unpaid invoices approaching due dates.

- [ ] **Step 2: Implement `CheckExpiringDoiSubscriptionsCommand.php`**

Implement `doi:check-expiring-subscriptions` handling transitions to `GRACE_PERIOD` and `EXPIRED` with detailed console log output and notification dispatches.

- [ ] **Step 3: Implement `SendInvoiceDueReminderCommand.php`**

Implement `doi:send-due-reminders` scanning unpaid invoices at H-30, H-14, H-7, H-1, H-0, and sending reminder notifications.

- [ ] **Step 4: Register schedules in `routes/console.php`**

Register daily schedules for `doi:check-expiring-subscriptions` (01:00 WIB) and `doi:send-due-reminders` (08:00 WIB).

- [ ] **Step 5: Run tests to verify all pass**

Run: `docker exec -i jurnal-mu-app php artisan test tests/Feature/Doi/DoiSchedulerAndNotificationTest.php`
Expected: PASS (All 6 test cases passing).

- [ ] **Step 6: Commit**

```bash
git add app/Console/Commands/Doi/ routes/console.php tests/Feature/Doi/DoiSchedulerAndNotificationTest.php
git commit -m "feat(doi): implement console scheduler commands and due date reminder job"
```

---

### Task 3: Full Verification & Regression Test Suite

**Files:**
- Full test suite & Vite build

- [ ] **Step 1: Run full DOI feature test suite in Docker**

Run: `docker exec -i jurnal-mu-app php artisan test --filter=Doi`
Expected: 100% tests PASS (Unit + Feature tests).

- [ ] **Step 2: Run frontend build check**

Run: `npm run build`
Expected: SUCCESS without error.

- [ ] **Step 3: Commit any adjustments if needed**
