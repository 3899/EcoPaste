use super::{shared_hide_window, shared_show_window};
use tauri::{command, AppHandle, Runtime, WebviewWindow};
use serde::Serialize;

#[derive(Serialize)]
pub struct CaretPosition {
    pub x: i32,
    pub y: i32,
    pub success: bool,
}

// 获取输入光标位置（Windows专用）
#[cfg(target_os = "windows")]
#[command]
pub fn get_caret_position() -> CaretPosition {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::{
        GetCaretPos, GetForegroundWindow, GetWindowThreadProcessId,
    };
    use windows::Win32::System::Threading::{GetCurrentThreadId, AttachThreadInput};
    use windows::Win32::Graphics::Gdi::ClientToScreen;

    unsafe {
        let mut point = POINT { x: 0, y: 0 };
        
        // 获取前台窗口
        let foreground = GetForegroundWindow();
        if foreground.is_invalid() {
            return CaretPosition { x: 0, y: 0, success: false };
        }
        
        // 获取前台窗口线程ID
        let foreground_thread = GetWindowThreadProcessId(foreground, None);
        let current_thread = GetCurrentThreadId();
        
        // 附加线程输入以获取正确的光标位置
        let _ = AttachThreadInput(current_thread, foreground_thread, true);
        
        // 获取光标位置
        let result = GetCaretPos(&mut point);
        
        // 分离线程输入
        let _ = AttachThreadInput(current_thread, foreground_thread, false);
        
        if result.is_ok() {
            // 转换为屏幕坐标（使用前台窗口）
            let _ = ClientToScreen(foreground, &mut point);
            CaretPosition { x: point.x, y: point.y, success: true }
        } else {
            CaretPosition { x: 0, y: 0, success: false }
        }
    }
}

#[cfg(not(target_os = "windows"))]
#[command]
pub fn get_caret_position() -> CaretPosition {
    CaretPosition { x: 0, y: 0, success: false }
}

// 显示窗口
#[command]
pub async fn show_window<R: Runtime>(_app_handle: AppHandle<R>, window: WebviewWindow<R>) {
    shared_show_window(&window);
}

// 隐藏窗口
#[command]
pub async fn hide_window<R: Runtime>(_app_handle: AppHandle<R>, window: WebviewWindow<R>) {
    shared_hide_window(&window);
}

// 显示任务栏图标
#[command]
pub async fn show_taskbar_icon<R: Runtime>(
    _app_handle: AppHandle<R>,
    window: WebviewWindow<R>,
    visible: bool,
) {
    let _ = window.set_skip_taskbar(!visible);
}

