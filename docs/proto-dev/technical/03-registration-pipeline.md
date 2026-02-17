# 3. Registration pipeline (profile creation)

## 3.1 Screen changes and progression

The `ViewService` watches `SCREEN_CHANGE` events and decides which template to render. It also handles the “Next” button path:

- welcome → registration → apartment‑plan → registration‑camera.
- It refuses to advance from registration until `ProfileRegistrationService.canProceed()` is true.

This is the technical counterpart of “establishing access” in the narrative.

## 3.2 Name capture

When the registration name input changes, `ViewService` receives `REGISTRATION_NAME_CHANGED` and forwards the value to `ProfileRegistrationService.setName()`.

- The same handler emits `NEXT_BUTTON_ENABLE` only when `ProfileRegistrationService.canProceed()` returns true.

## 3.3 Avatar capture

The avatar capture is performed in the `registration-camera` screen:

- `ViewService` switches to camera mode and boots `CameraSectionManager` with a **registration** strategy.
- `ViewService.handleCaptureEvents()` either uses the last successful detection or triggers a fresh capture.
- On detection success, `_storeAvatarFromBlob()` converts the blob to base64, stores it in `ProfileRegistrationService`, and emits `CAMERA_PREVIEW_READY` so the preview UI is visible.

## 3.4 Finalizing registration

When the user taps “Finish”:

- `ViewService.handleCaptureEvents()` ensures presence + avatar are true.
- It calls `ProfileRegistrationService.saveProfile()`, which writes the profile to the SQL.js database and emits `USER_PROFILE_SAVED`.
- `ViewService` persists `userId` + `captured` flags, notifies the user, and moves to `SCREEN_CHANGE: messenger`.

**Next:** [4. Messenger boot and dialog orchestration](04-dialog-orchestration.md)
