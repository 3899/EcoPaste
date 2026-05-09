const COMMANDS: &[&str] = &["paste", "paste_fast"];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
