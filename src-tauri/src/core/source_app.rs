use base64::{engine::general_purpose, Engine as _};
use image::codecs::png::PngEncoder;
use serde::{Deserialize, Serialize};
use std::io::Cursor;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceAppInfo {
    pub app_name: String,
    pub app_icon: Option<String>,
}

fn get_icon_from_path(app_path: &str) -> Option<String> {
    let icon_result = file_icon_provider::get_file_icon(app_path, 64).ok()?;
    let img =
        image::RgbaImage::from_raw(icon_result.width, icon_result.height, icon_result.pixels)?;

    let mut buffer = Cursor::new(Vec::new());
    let encoder = PngEncoder::new(&mut buffer);
    img.write_with_encoder(encoder).ok()?;

    let base64_str = general_purpose::STANDARD.encode(buffer.get_ref());
    Some(format!("data:image/png;base64,{}", base64_str))
}

#[cfg(target_os = "windows")]
pub fn get_clipboard_owner_process() -> Result<(String, String), String> {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::System::DataExchange::GetClipboardOwner;
    use windows::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32,
        PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows::Win32::UI::WindowsAndMessaging::GetWindowThreadProcessId;

    unsafe {
        let hwnd_owner: HWND = GetClipboardOwner().map_err(|e| e.to_string())?;

        if hwnd_owner.is_invalid() {
            return Err("Failed to get clipboard owner".to_string());
        }

        let mut process_id: u32 = 0;
        GetWindowThreadProcessId(hwnd_owner, Some(&mut process_id as *mut u32));

        if process_id == 0 {
            return Err("Failed to get process ID".to_string());
        }

        let process_handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, process_id)
            .map_err(|e| e.to_string())?;

        let mut exe_path = vec![0u16; 260];
        let mut exe_path_len = exe_path.len() as u32;

        QueryFullProcessImageNameW(
            process_handle,
            PROCESS_NAME_WIN32,
            windows::core::PWSTR(exe_path.as_mut_ptr()),
            &mut exe_path_len,
        )
        .map_err(|e| e.to_string())?;

        let exe_path_str = String::from_utf16_lossy(&exe_path[..exe_path_len as usize]);
        let process_name = std::path::Path::new(&exe_path_str)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Unknown")
            .to_string();

        Ok((process_name, exe_path_str))
    }
}

#[cfg(not(target_os = "windows"))]
pub fn get_clipboard_owner_process() -> Result<(String, String), String> {
    Err("Not supported".to_string())
}

#[cfg(target_os = "windows")]
pub fn get_active_window_process() -> Result<(String, String), String> {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32,
        PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowThreadProcessId};

    unsafe {
        let hwnd: HWND = GetForegroundWindow();
        if hwnd.0.is_null() {
            return Err("No active window".to_string());
        }

        let mut process_id: u32 = 0;
        GetWindowThreadProcessId(hwnd, Some(&mut process_id as *mut u32));

        if process_id == 0 {
            return Err("Failed to get process ID".to_string());
        }

        let process_handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, process_id)
            .map_err(|e| e.to_string())?;

        let mut exe_path = vec![0u16; 260];
        let mut exe_path_len = exe_path.len() as u32;

        QueryFullProcessImageNameW(
            process_handle,
            PROCESS_NAME_WIN32,
            windows::core::PWSTR(exe_path.as_mut_ptr()),
            &mut exe_path_len,
        )
        .map_err(|e| e.to_string())?;

        let exe_path_str = String::from_utf16_lossy(&exe_path[..exe_path_len as usize]);
        let process_name = std::path::Path::new(&exe_path_str)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("Unknown")
            .to_string();

        Ok((process_name, exe_path_str))
    }
}

#[cfg(not(target_os = "windows"))]
pub fn get_active_window_process() -> Result<(String, String), String> {
    Err("Not supported".to_string())
}

#[tauri::command]
pub fn get_source_app_info() -> Result<SourceAppInfo, String> {
    #[cfg(target_os = "windows")]
    {
        if let Ok((process_name, process_path)) = get_clipboard_owner_process() {
            let app_icon = get_icon_from_path(&process_path);
            return Ok(SourceAppInfo {
                app_name: process_name,
                app_icon,
            });
        }
        if let Ok((process_name, process_path)) = get_active_window_process() {
            let app_icon = get_icon_from_path(&process_path);
            return Ok(SourceAppInfo {
                app_name: process_name,
                app_icon,
            });
        }
    }

    Err("Failed to get source app info".to_string())
}
