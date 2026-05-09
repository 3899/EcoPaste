use std::{
    fs::{create_dir_all, OpenOptions},
    io::Write,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{async_runtime::spawn, AppHandle, Manager, Runtime, WebviewWindow};

// 主窗口的label
pub static MAIN_WINDOW_LABEL: &str = "main";
// 偏好设置窗口的label
pub static PREFERENCE_WINDOW_LABEL: &str = "preference";
// 主窗口的title
pub static MAIN_WINDOW_TITLE: &str = "EcoPaste";

#[cfg(target_os = "macos")]
mod macos;

#[cfg(not(target_os = "macos"))]
mod not_macos;

#[cfg(target_os = "macos")]
pub use macos::*;

#[cfg(not(target_os = "macos"))]
pub use not_macos::*;

// 是否为主窗口
pub fn is_main_window<R: Runtime>(window: &WebviewWindow<R>) -> bool {
    window.label() == MAIN_WINDOW_LABEL
}

fn crash_log_path() -> PathBuf {
    let base = std::env::var_os("LOCALAPPDATA")
        .or_else(|| std::env::var_os("APPDATA"))
        .map(PathBuf::from)
        .unwrap_or_else(std::env::temp_dir);

    base.join("EcoPaste").join("logs").join("crash.log")
}

fn append_crash_event(message: impl AsRef<str>) {
    let timestamp = match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => format!("unix_ms={}", duration.as_millis()),
        Err(_) => "unix_ms=unknown".to_string(),
    };
    let path = crash_log_path();

    if let Some(parent) = path.parent() {
        let _ = create_dir_all(parent);
    }

    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
        let _ = writeln!(file, "[{timestamp}][event] {}", message.as_ref());
        let _ = file.flush();
    }
}

// 共享显示窗口的方法
fn shared_show_window<R: Runtime>(window: &WebviewWindow<R>) {
    let is_visible = window.is_visible().unwrap_or(false);
    let is_minimized = window.is_minimized().unwrap_or(false);

    log::info!(
        "show_window requested: label={}, visible={}, minimized={}",
        window.label(),
        is_visible,
        is_minimized
    );
    append_crash_event(format!(
        "window show requested: label={}, visible={}, minimized={}",
        window.label(),
        is_visible,
        is_minimized
    ));

    if is_visible && !is_minimized {
        append_crash_event(format!(
            "window show skipped: label={}, already visible",
            window.label()
        ));
        return;
    }

    if let Err(error) = window.show() {
        append_crash_event(format!("window show failed: label={}, error={error}", window.label()));
    }

    if let Err(error) = window.unminimize() {
        append_crash_event(format!(
            "window unminimize failed: label={}, error={error}",
            window.label()
        ));
    }
}

// 共享隐藏窗口的方法
fn shared_hide_window<R: Runtime>(window: &WebviewWindow<R>) {
    log::info!("hide_window requested: label={}", window.label());
    append_crash_event(format!("window hide requested: label={}", window.label()));

    if let Err(error) = window.hide() {
        append_crash_event(format!("window hide failed: label={}, error={error}", window.label()));
    }
}

// 显示主窗口
pub fn show_main_window(app_handle: &AppHandle) {
    show_window_by_label(app_handle, MAIN_WINDOW_LABEL);
}

// 显示偏好设置窗口
pub fn show_preference_window(app_handle: &AppHandle) {
    show_window_by_label(app_handle, PREFERENCE_WINDOW_LABEL);
}

// 显示指定 label 的窗口
fn show_window_by_label(app_handle: &AppHandle, label: &str) {
    if let Some(window) = app_handle.get_webview_window(label) {
        let app_handle_clone = app_handle.clone();

        spawn(async move {
            show_window(app_handle_clone, window).await;
        });
    }
}
