#!/usr/bin/env python3
import subprocess
import tkinter as tk
from pathlib import Path
from tkinter import messagebox
from urllib.request import urlopen
from urllib.error import URLError
import webbrowser

APP_DIR = Path.home() / "Projects/FinanceTracker/V1"
SCRIPTS_DIR = APP_DIR / "scripts"
START_SCRIPT = SCRIPTS_DIR / "open-finance-tracker.sh"
STOP_SCRIPT = SCRIPTS_DIR / "stop-finance-tracker.sh"
LOG_FILE = APP_DIR / "logs/app.log"
URL = "http://127.0.0.1:3000"


def is_up() -> bool:
    try:
        with urlopen(URL, timeout=1):
            return True
    except Exception:
        return False


class App:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Finance Tracker Control")
        self.root.geometry("380x220")
        self.root.resizable(False, False)
        self.root.configure(bg="#f8f9fb")

        frame = tk.Frame(root, bg="#f8f9fb", padx=20, pady=20)
        frame.pack(fill="both", expand=True)

        title = tk.Label(
            frame,
            text="Finance Tracker",
            font=("Inter", 16, "bold"),
            bg="#f8f9fb",
            fg="#1e293b",
        )
        title.pack(anchor="w")

        subtitle = tk.Label(
            frame,
            text="Simple local app control",
            font=("Inter", 10),
            bg="#f8f9fb",
            fg="#64748b",
        )
        subtitle.pack(anchor="w", pady=(2, 14))

        self.status_var = tk.StringVar()
        self.status_chip = tk.Label(
            frame,
            textvariable=self.status_var,
            font=("Inter", 10, "bold"),
            bg="#eef2ff",
            fg="#4338ca",
            padx=10,
            pady=6,
        )
        self.status_chip.pack(anchor="w", pady=(0, 16))

        buttons = tk.Frame(frame, bg="#f8f9fb")
        buttons.pack(fill="x")

        self.action_btn = self.make_btn(buttons, "Start + Open", self.toggle_app, "#6366f1", 0, 0)
        self.open_btn = self.make_btn(buttons, "Open Browser", self.open_browser, "#0f172a", 0, 1)

        hint = tk.Label(
            frame,
            text="Logs: ~/Projects/FinanceTracker/V1/logs/app.log",
            font=("Inter", 9),
            bg="#f8f9fb",
            fg="#94a3b8",
        )
        hint.pack(anchor="w", pady=(18, 0))

        self.refresh_status()
        self.root.after(5000, self.auto_refresh)

    def make_btn(self, parent, text, command, bg, row, col):
        btn = tk.Button(
            parent,
            text=text,
            command=command,
            bg=bg,
            fg="white",
            activebackground=bg,
            activeforeground="white",
            disabledforeground="white",
            relief="flat",
            font=("Inter", 10, "bold"),
            padx=12,
            pady=10,
            cursor="hand2",
            width=14,
        )
        btn.grid(row=row, column=col, padx=6, pady=6, sticky="ew")
        parent.grid_columnconfigure(col, weight=1)
        return btn

    def run_script(self, script: Path):
        try:
            subprocess.Popen([str(script)], cwd=APP_DIR)
        except Exception as e:
            messagebox.showerror("Error", str(e))
        self.root.after(1500, self.refresh_status)

    def toggle_app(self):
        if is_up():
            self.stop_app()
        else:
            self.start_app()

    def start_app(self):
        self.status_var.set("Status: Starting...")
        self.status_chip.configure(bg="#eef2ff", fg="#4338ca")
        self.action_btn.configure(text="Starting...", state="disabled", bg="#818cf8", activebackground="#818cf8")
        self.run_script(START_SCRIPT)

    def stop_app(self):
        self.status_var.set("Status: Stopping...")
        self.status_chip.configure(bg="#fff7ed", fg="#9a3412")
        self.action_btn.configure(text="Stopping...", state="disabled", bg="#f87171", activebackground="#f87171")
        self.run_script(STOP_SCRIPT)

    def open_browser(self):
        webbrowser.open(URL)

    def refresh_status(self):
        if is_up():
            self.status_var.set("Status: Running on localhost:3000")
            self.status_chip.configure(bg="#dcfce7", fg="#166534")
            self.action_btn.configure(text="Stop", state="normal", bg="#ef4444", activebackground="#ef4444")
            self.open_btn.configure(state="normal", bg="#0f172a", activebackground="#0f172a")
        else:
            self.status_var.set("Status: Stopped")
            self.status_chip.configure(bg="#fee2e2", fg="#991b1b")
            self.action_btn.configure(text="Start + Open", state="normal", bg="#6366f1", activebackground="#6366f1")
            self.open_btn.configure(state="disabled", bg="#94a3b8", activebackground="#94a3b8")

    def auto_refresh(self):
        self.refresh_status()
        self.root.after(5000, self.auto_refresh)


if __name__ == "__main__":
    root = tk.Tk()
    App(root)
    root.mainloop()
