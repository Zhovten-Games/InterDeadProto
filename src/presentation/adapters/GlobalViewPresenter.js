import NullEventBus from '../../core/events/NullEventBus.js';
import DialogWidget from '../widgets/Dialog/index.js';
import CameraStatusWidget from '../widgets/CameraStatusWidget.js';
import MessengerPostsWidget from '../widgets/MessengerPostsWidget.js';
import LocationStatusWidget from '../widgets/LocationStatusWidget.js';
import TextFieldAnimator from '../components/forms/TextFieldAnimator.js';
import {
  VIEW_RENDER_REQUESTED,
  VIEW_CAMERA_RENDER_REQUESTED,
  MESSENGER_POSTS_READY,
  REGISTRATION_NAME_CHANGED,
  GEO_STATUS_UPDATED,
  CAMERA_PREVIEW_READY,
  CAMERA_PREVIEW_CLEARED,
  DIALOG_WIDGET_READY,
  DIALOG_CLEAR,
  EVENT_MESSAGE_READY,
  QUEST_ITEM_OVERLAY_READY,
  APP_RESET_COMPLETED,
  PROFILE_IMPORT_REQUESTED,
  PROFILE_IMPORT_COMPLETED,
  PROFILE_EXPORT_REQUESTED,
  PROFILE_EXPORT_CONFIRMED,
  PROFILE_EXPORT_READY,
  PROFILE_TRANSFER_FAILED,
  PROFILE_IMPORT_SELECTED,
  STATUS_SHOW,
  MODAL_SHOW,
  MODAL_HIDE
} from '../../core/events/constants.js';

export default class GlobalViewPresenter {
  constructor(
    templateService,
    panelService,
    languageManager,
    bus = new NullEventBus(),
    mediaRepository = null,
    logger = console,
    textFieldAnimator = null
  ) {
    this.templateService = templateService;
    this.panelService = panelService;
    this.languageManager = languageManager;
    this.bus = bus;
    this.mediaRepository = mediaRepository;
    this.logger = logger;
    this.textFieldAnimator = textFieldAnimator || new TextFieldAnimator();

    this.currentScreen = null;
    this.dialogWidget = null;
    this.cameraUi = null;
    this.postsWidget = null;
    this.locationWidget = null;
    this._previewRevoke = null;
    this._registrationInput = null;
    this._modalNode = null;

    this._handler = this._handleEvent.bind(this);
  }

  boot() {
    this.bus.subscribe(this._handler);
  }

  dispose() {
    this.bus.unsubscribe(this._handler);
    this._disposeDialog();
    this._disposeCamera();
    this._teardownRegistration();
    this.postsWidget = null;
    this.locationWidget = null;
    this.textFieldAnimator?.cancel?.();
  }

  async _handleEvent(evt) {
    switch (evt?.type) {
      case VIEW_RENDER_REQUESTED:
        await this._renderScreen(evt);
        break;
      case VIEW_CAMERA_RENDER_REQUESTED:
        await this._renderCameraScreen(evt);
        break;
      case MESSENGER_POSTS_READY:
        await this._renderPosts(evt);
        break;
      case GEO_STATUS_UPDATED:
        await this._renderGeo(evt);
        break;
      case CAMERA_PREVIEW_READY:
        await this._showPreview(evt);
        break;
      case CAMERA_PREVIEW_CLEARED:
        this._clearPreview();
        break;
      case DIALOG_CLEAR:
      case EVENT_MESSAGE_READY:
      case DIALOG_WIDGET_READY:
      case QUEST_ITEM_OVERLAY_READY:
      case 'CAMERA_VIEW_CLOSED':
      case 'SCREEN_CHANGE':
        this._handleDialogState(evt);
        break;
      case APP_RESET_COMPLETED:
        this._handleReset(evt);
        break;
      case PROFILE_IMPORT_REQUESTED:
        this._handleProfileImportRequest();
        break;
      case PROFILE_EXPORT_REQUESTED:
        this._handleProfileExportRequest();
        break;
      case PROFILE_EXPORT_READY:
        this._handleProfileExportReady(evt);
        break;
      case PROFILE_TRANSFER_FAILED:
        this._handleProfileTransferFailure(evt);
        break;
      case PROFILE_IMPORT_COMPLETED:
        this._handleProfileImportCompleted();
        break;
      default:
        break;
    }
  }

  async _renderScreen(evt) {
    const { screen, payload = {}, view = {} } = evt;
    if (!screen) return;

    if (this.currentScreen && this.currentScreen !== screen) {
      if (this.currentScreen === 'messenger') {
        this._disposeDialog();
        this.postsWidget = null;
      }
      if (this.currentScreen === 'registration') {
        this._teardownRegistration();
      }
      if (
        this.currentScreen === 'apartment-plan' &&
        screen !== 'apartment-plan'
      ) {
        this.locationWidget = null;
      }
      if (this.currentScreen === 'camera' || this.currentScreen === 'registration-camera') {
        this._disposeCamera();
      }
    }

    const globalEl = document.querySelector('[data-js="global-content"]');
    await this.templateService.renderSection(globalEl, screen, payload);
    this.languageManager.applyLanguage(globalEl);
    await this.panelService.load({ screen });

    if (screen === 'messenger') {
      const list = globalEl.querySelector('[data-js="posts-list"]');
      this.postsWidget = new MessengerPostsWidget(list, this.languageManager);
      await this._renderPosts({ posts: view.posts || [] });

      const dlgContainer = globalEl.querySelector('[data-js="dialog-list"]');
      if (dlgContainer) {
        this._disposeDialog();
        this.dialogWidget = new DialogWidget(
          dlgContainer,
          this.templateService,
          this.languageManager,
          this.bus,
          this.mediaRepository
        );
        await this.dialogWidget.boot();
        this._handleDialogState({ type: 'INIT' });
        Promise.resolve().then(() => this.bus.emit({ type: DIALOG_WIDGET_READY }));
      }
    } else if (screen === 'registration') {
      const input = globalEl.querySelector('[data-js="input-name"]');
      if (input) {
        this._registrationInput = input;
        input.addEventListener('input', this._handleRegistrationInput);
        if (view.registration?.name) {
          this._registrationInput.value = view.registration.name;
        }
      }
      const label = globalEl.querySelector('[data-js="registration-label"]');
      if (label) {
        this.textFieldAnimator?.cancel?.();
        void this.textFieldAnimator.animate(label, label.textContent);
      }
    }

    if (screen === 'apartment-plan') {
      const display = globalEl.querySelector('[data-js="location-display"]');
      this.locationWidget = new LocationStatusWidget(display, this.languageManager);
    }

    this.currentScreen = screen;
  }

  async _renderCameraScreen(evt) {
    const { screen, camera = {} } = evt;
    const { options = {}, panel = {} } = camera;
    const globalEl = document.querySelector('[data-js="global-content"]');
    await this.templateService.renderSection(globalEl, screen);
    const container = document.querySelector('[data-js="global-content"]');
    const widgetContainer = container?.querySelector('[data-js="camera-widget"]');
    if (widgetContainer) {
      this._disposeCamera();
      this.cameraUi = new CameraStatusWidget(widgetContainer, this.languageManager, this.bus);
      this.cameraUi.render();
      this.cameraUi.boot();
    }
    this.languageManager.applyLanguage(container);
    await this.panelService.load({ screen, ...panel });
    const camView = container?.querySelector('[data-js="camera-view"]');
    if (camView) {
      this.bus.emit({ type: 'CAMERA_VIEW_OPENED', container: camView, options });
    }
    this.currentScreen = screen;
  }

  async _renderPosts({ posts = [] }) {
    if (!this.postsWidget) return;
    await this.postsWidget.render(posts);
  }

  _teardownRegistration() {
    if (this._registrationInput) {
      this._registrationInput.removeEventListener('input', this._handleRegistrationInput);
      this._registrationInput = null;
    }
    this.textFieldAnimator?.cancel?.();
  }

  async _renderGeo({ status, panel }) {
    if (!this.locationWidget) return;
    if (!status) {
      this.locationWidget.clear();
      return;
    }
    if (status.mode === 'local') {
      await this.locationWidget.showLocalMode();
    } else if (status.mode === 'coords' && status.coords) {
      await this.locationWidget.showCoordinates(status.coords.lat, status.coords.lng);
    }
    if (panel) {
      await this.panelService.load(panel);
    }
  }

  async _showPreview({ blobUrl, avatarUrl }) {
    const container = this.cameraUi?.container;
    if (!container) return;
    const preview = container.querySelector('[data-js="selfie-preview"]');
    const camView = container.querySelector('[data-js="camera-view"]');
    if (!preview) return;

    let url = avatarUrl || blobUrl;
    if (!url && blobUrl === undefined) return;

    if (this._previewRevoke) {
      this._previewRevoke();
      this._previewRevoke = null;
    }

    preview.src = url || '';
    preview.hidden = !url;
    if (camView && url) camView.hidden = true;

    if (blobUrl) {
      this._previewRevoke = () => URL.revokeObjectURL(blobUrl);
    }
  }

  _clearPreview(container = this.cameraUi?.container) {
    const preview = container?.querySelector('[data-js="selfie-preview"]');
    const camView = container?.querySelector('[data-js="camera-view"]');
    if (preview) {
      preview.src = '';
      preview.hidden = true;
    }
    if (camView) camView.hidden = false;
    if (this._previewRevoke) {
      this._previewRevoke();
      this._previewRevoke = null;
    }
  }

  _handleDialogState() {
    // Dialog state updates no longer rely on an empty placeholder element.
  }

  _handleReset() {
    this._disposeDialog();
    this._disposeCamera();
    this._clearPreview();
    this.currentScreen = null;
  }

  _disposeDialog() {
    if (this.dialogWidget) {
      this.dialogWidget.dispose?.();
      this.dialogWidget = null;
    }
  }

  _disposeCamera() {
    const container = this.cameraUi?.container || null;
    if (this.cameraUi) {
      this.bus.emit({ type: 'CAMERA_VIEW_CLOSED' });
      this.cameraUi.dispose?.();
      this.cameraUi = null;
    }
    this._clearPreview(container);
  }

  _handleProfileImportRequest() {
    const node = this._renderTransferModal('import');
    if (node) this._showModal(node);
  }

  _handleProfileExportRequest() {
    const node = this._renderTransferModal('export');
    if (node) this._showModal(node);
  }

  _handleProfileExportReady(evt) {
    this._hideModal();
    const blobData = evt?.payload?.blob;
    if (!blobData) {
      this.logger?.warn?.('Profile export ready without blob payload');
      return;
    }
    const meta = evt?.payload?.meta || {};
    const ghost = meta.currentGhost || 'profile';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${ghost}-export-${timestamp}.bin`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 0);
    this._showStatus('profile_export_success');
  }

  _handleProfileTransferFailure(evt) {
    const { operation } = evt?.payload || {};
    this.logger?.error?.(`Profile transfer failed: ${operation || 'unknown'}`);
    this._showStatus('profile_transfer_error');
    this._hideModal();
  }

  _handleProfileImportCompleted() {
    this._showStatus('profile_import_success');
  }

  async _showStatus(i18nKey) {
    if (!this.languageManager?.translate) return;
    try {
      const message = await this.languageManager.translate(i18nKey);
      if (message) {
        this.bus.emit({ type: STATUS_SHOW, message });
      }
    } catch (err) {
      this.logger?.warn?.(`Failed to translate status ${i18nKey}: ${err?.message || err}`);
    }
  }

  _renderTransferModal(mode) {
    if (typeof document === 'undefined') return null;
    const container = document.createElement('div');
    container.className = 'profile-transfer';

    const title = document.createElement('h2');
    title.className = 'profile-transfer__title';
    title.setAttribute('data-i18n', mode === 'import' ? 'profile_import_title' : 'profile_export_title');
    container.appendChild(title);

    const description = document.createElement('p');
    description.className = 'profile-transfer__description';
    description.setAttribute(
      'data-i18n',
      mode === 'import' ? 'profile_import_description' : 'profile_export_description'
    );
    container.appendChild(description);

    let fileInput = null;
    if (mode === 'import') {
      const fileField = document.createElement('label');
      fileField.className = 'profile-transfer__field';
      const span = document.createElement('span');
      span.setAttribute('data-i18n', 'profile_import_file_label');
      fileField.appendChild(span);
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.bin,.json,.ghost,.profile,.enc';
      fileInput.className = 'profile-transfer__input';
      fileField.appendChild(fileInput);
      container.appendChild(fileField);
    }

    const passwordField = document.createElement('label');
    passwordField.className = 'profile-transfer__field';
    const passLabel = document.createElement('span');
    passLabel.setAttribute(
      'data-i18n',
      mode === 'import' ? 'profile_import_password_label' : 'profile_export_password_label'
    );
    passwordField.appendChild(passLabel);
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.className = 'profile-transfer__input';
    passwordField.appendChild(passwordInput);
    container.appendChild(passwordField);

    const errorEl = document.createElement('div');
    errorEl.className = 'profile-transfer__error';
    container.appendChild(errorEl);

    const actions = document.createElement('div');
    actions.className = 'profile-transfer__actions';
    const confirm = document.createElement('button');
    confirm.className = 'button';
    confirm.type = 'button';
    confirm.setAttribute('data-i18n', mode === 'import' ? 'profile_import_confirm' : 'profile_export_confirm');
    const cancel = document.createElement('button');
    cancel.className = 'button button--ghost';
    cancel.type = 'button';
    cancel.setAttribute('data-i18n', 'profile_transfer_cancel');
    actions.appendChild(confirm);
    actions.appendChild(cancel);
    container.appendChild(actions);

    const setError = key => {
      if (!key) {
        errorEl.textContent = '';
        return;
      }
      this.languageManager
        ?.translate?.(key)
        .then(msg => {
          errorEl.textContent = msg || '';
        })
        .catch(() => {
          errorEl.textContent = key;
        });
    };

    confirm.addEventListener('click', async () => {
      if (confirm.disabled) return;
      setError('');
      if (mode === 'import' && (!fileInput || !fileInput.files?.length)) {
        setError('profile_import_file_required');
        return;
      }
      confirm.disabled = true;
      confirm.classList.add('button--disabled');
      try {
        if (mode === 'import') {
          const file = fileInput.files[0];
          const buffer = await file.arrayBuffer();
          this.bus.emit({
            type: PROFILE_IMPORT_SELECTED,
            payload: {
              name: file.name,
              buffer,
              password: passwordInput.value || ''
            }
          });
          this._hideModal();
        } else {
          this.bus.emit({
            type: PROFILE_EXPORT_CONFIRMED,
            payload: { password: passwordInput.value || '' }
          });
        }
      } catch (err) {
        confirm.disabled = false;
        confirm.classList.remove('button--disabled');
        setError('profile_transfer_error');
        this.logger?.error?.(`Profile transfer dialog failed: ${err?.message || err}`);
      }
    });

    cancel.addEventListener('click', () => {
      this._hideModal();
    });

    this.languageManager.applyLanguage(container);
    return container;
  }

  _showModal(node) {
    if (!node) return;
    this._modalNode = node;
    this.bus.emit({ type: MODAL_SHOW, node });
  }

  _hideModal() {
    if (!this._modalNode) return;
    this.bus.emit({ type: MODAL_HIDE });
    this._modalNode = null;
  }

  _handleRegistrationInput = evt => {
    this.bus.emit({ type: REGISTRATION_NAME_CHANGED, payload: { value: evt.target.value } });
  };
}

