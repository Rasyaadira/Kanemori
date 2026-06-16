#!/usr/bin/env python3
import atexit
import os
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.request import urlopen

from PySide6.QtCore import QTimer, Qt, QUrl
from PySide6.QtGui import QAction, QIcon
from PySide6.QtWidgets import (
    QApplication,
    QLabel,
    QMainWindow,
    QMessageBox,
    QProgressBar,
    QToolBar,
    QVBoxLayout,
    QWidget,
)
from PySide6.QtWebEngineWidgets import QWebEngineView

APP_NAME = 'Kanemori'
APP_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = APP_DIR / 'logs'
LOG_FILE = LOG_DIR / 'app.log'
PID_FILE = LOG_DIR / 'kanemori.pid'
URL = 'http://127.0.0.1:3000'
PORT = 3000


class StartupError(RuntimeError):
    pass


def port_open(host: str = '127.0.0.1', port: int = PORT, timeout: float = 0.5) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(timeout)
        return sock.connect_ex((host, port)) == 0


def http_up(url: str = URL, timeout: float = 1.0) -> bool:
    try:
        with urlopen(url, timeout=timeout):
            return True
    except Exception:
        return False


def build_exists() -> bool:
    return (APP_DIR / '.next' / 'BUILD_ID').exists()


def run_logged(command: list[str], status_cb=None):
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    if status_cb:
        status_cb('Preparing app files...')
    with LOG_FILE.open('a', encoding='utf-8') as log:
        log.write(f"\n\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] RUN {' '.join(command)}\n")
        result = subprocess.run(
            command,
            cwd=APP_DIR,
            stdout=log,
            stderr=subprocess.STDOUT,
            text=True,
        )
    if result.returncode != 0:
        raise StartupError(f"Command failed: {' '.join(command)}")


class KanemoriWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.server_process: subprocess.Popen | None = None
        self.started_server = False
        self.ready = False
        self.setWindowTitle(APP_NAME)
        self.resize(1440, 920)
        self.setMinimumSize(1100, 720)

        self.browser = QWebEngineView(self)
        self.status_label = QLabel('Starting Kanemori...')
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status_label.setStyleSheet('font-size: 15px; color: #334155;')

        self.progress = QProgressBar()
        self.progress.setRange(0, 0)
        self.progress.setTextVisible(False)
        self.progress.setFixedWidth(320)
        self.progress.setStyleSheet(
            'QProgressBar { border: 1px solid #dbeafe; border-radius: 8px; background: #eff6ff; height: 12px; }'
            'QProgressBar::chunk { background: #2853FF; border-radius: 8px; }'
        )

        self.loading = QWidget()
        loading_layout = QVBoxLayout(self.loading)
        loading_layout.setContentsMargins(24, 24, 24, 24)
        loading_layout.addStretch()
        title = QLabel(APP_NAME)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet('font-size: 28px; font-weight: 700; color: #0f172a;')
        subtitle = QLabel('Opening your finance app...')
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setStyleSheet('font-size: 13px; color: #64748b; margin-bottom: 14px;')
        loading_layout.addWidget(title)
        loading_layout.addWidget(subtitle)
        loading_layout.addWidget(self.progress, alignment=Qt.AlignmentFlag.AlignCenter)
        loading_layout.addSpacing(14)
        loading_layout.addWidget(self.status_label)
        loading_layout.addStretch()

        container = QWidget()
        self.container_layout = QVBoxLayout(container)
        self.container_layout.setContentsMargins(0, 0, 0, 0)
        self.container_layout.addWidget(self.loading)
        self.setCentralWidget(container)

        toolbar = QToolBar('Navigation')
        toolbar.setMovable(False)
        toolbar.setVisible(False)
        self.addToolBar(toolbar)
        self.toolbar = toolbar

        back_action = QAction('Back', self)
        back_action.triggered.connect(self.browser.back)
        reload_action = QAction('Refresh', self)
        reload_action.triggered.connect(self.browser.reload)
        toolbar.addAction(back_action)
        toolbar.addAction(reload_action)

        self.browser.loadFinished.connect(self.on_page_loaded)
        self.browser.setContextMenuPolicy(Qt.ContextMenuPolicy.DefaultContextMenu)

        self.poll_timer = QTimer(self)
        self.poll_timer.timeout.connect(self.check_server_ready)
        self.poll_attempts = 0

        atexit.register(self.cleanup_server)

    def set_status(self, text: str):
        self.status_label.setText(text)
        QApplication.processEvents()

    def ensure_server(self):
        if http_up():
            self.set_status('Connecting to existing Kanemori server...')
            self.started_server = False
            return

        if not build_exists():
            self.set_status('Building app for first launch, this can take a bit...')
            run_logged(['npm', 'run', 'build'], status_cb=self.set_status)

        self.set_status('Starting local Kanemori server...')
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        log_handle = LOG_FILE.open('a', encoding='utf-8')
        self.server_process = subprocess.Popen(
            ['npm', 'run', 'start'],
            cwd=APP_DIR,
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            text=True,
        )
        PID_FILE.write_text(str(self.server_process.pid), encoding='utf-8')
        self.started_server = True

    def start(self):
        try:
            self.ensure_server()
        except Exception as exc:
            QMessageBox.critical(self, APP_NAME, f'Failed to start app.\n\n{exc}\n\nLog: {LOG_FILE}')
            raise

        self.poll_attempts = 0
        self.check_server_ready()
        self.poll_timer.start(1000)

    def check_server_ready(self):
        self.poll_attempts += 1
        if http_up():
            self.poll_timer.stop()
            self.set_status('Loading app window...')
            self.browser.setUrl(QUrl(URL))
            return

        if self.server_process and self.server_process.poll() is not None:
            self.poll_timer.stop()
            code = self.server_process.returncode
            QMessageBox.critical(self, APP_NAME, f'Kanemori server exited early (code {code}).\n\nCheck log:\n{LOG_FILE}')
            self.cleanup_server()
            self.close()
            return

        if self.poll_attempts > 60:
            self.poll_timer.stop()
            QMessageBox.critical(self, APP_NAME, f'Server took too long to start.\n\nCheck log:\n{LOG_FILE}')
            self.cleanup_server()
            self.close()
            return

        self.set_status(f'Starting local server, please wait... ({self.poll_attempts}s)')

    def on_page_loaded(self, ok: bool):
        if not ok or self.ready:
            return
        self.ready = True
        self.toolbar.setVisible(True)
        self.container_layout.removeWidget(self.loading)
        self.loading.setParent(None)
        self.container_layout.addWidget(self.browser)
        self.setWindowTitle(APP_NAME)

    def cleanup_server(self):
        if not self.started_server:
            return

        pid = None
        try:
            if PID_FILE.exists():
                pid = PID_FILE.read_text(encoding='utf-8').strip()
        except Exception:
            pid = None

        if self.server_process and self.server_process.poll() is None:
            try:
                self.server_process.terminate()
                self.server_process.wait(timeout=8)
            except Exception:
                try:
                    self.server_process.kill()
                except Exception:
                    pass

        if pid:
            try:
                os.kill(int(pid), signal.SIGTERM)
            except Exception:
                pass

        try:
            if PID_FILE.exists():
                PID_FILE.unlink()
        except Exception:
            pass

        self.started_server = False
        self.server_process = None

    def closeEvent(self, event):  # noqa: N802
        if self.started_server:
            reply = QMessageBox.question(
                self,
                APP_NAME,
                'Close Kanemori and stop its local server?',
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
                QMessageBox.StandardButton.Yes,
            )
            if reply == QMessageBox.StandardButton.Yes:
                self.cleanup_server()
            else:
                self.started_server = False
                self.server_process = None
        super().closeEvent(event)


def main():
    app = QApplication(sys.argv)
    app.setApplicationName(APP_NAME)
    app.setQuitOnLastWindowClosed(True)

    window = KanemoriWindow()
    window.show()
    window.start()
    sys.exit(app.exec())


if __name__ == '__main__':
    main()
