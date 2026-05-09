use std::{
    backtrace::Backtrace,
    collections::VecDeque,
    fs::{create_dir_all, OpenOptions},
    io::Write,
    panic,
    path::PathBuf,
    sync::{Mutex, OnceLock},
    time::{SystemTime, UNIX_EPOCH},
};

const RECENT_EVENT_LIMIT: usize = 80;

static RECENT_EVENTS: OnceLock<Mutex<VecDeque<String>>> = OnceLock::new();

fn crash_log_path() -> PathBuf {
    let base = std::env::var_os("LOCALAPPDATA")
        .or_else(|| std::env::var_os("APPDATA"))
        .map(PathBuf::from)
        .unwrap_or_else(std::env::temp_dir);

    base.join("EcoPaste").join("logs").join("crash.log")
}

fn timestamp() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => format!("unix_ms={}", duration.as_millis()),
        Err(_) => "unix_ms=unknown".to_string(),
    }
}

fn append(entry: &str) {
    let path = crash_log_path();

    if let Some(parent) = path.parent() {
        let _ = create_dir_all(parent);
    }

    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
        let _ = writeln!(file, "{entry}");
        let _ = file.flush();
    }
}

pub fn append_event(message: impl AsRef<str>) {
    let entry = format!("[{}][event] {}", timestamp(), message.as_ref());

    if let Ok(mut events) = RECENT_EVENTS
        .get_or_init(|| Mutex::new(VecDeque::with_capacity(RECENT_EVENT_LIMIT)))
        .lock()
    {
        if events.len() >= RECENT_EVENT_LIMIT {
            events.pop_front();
        }
        events.push_back(entry.clone());
    }

    append(&entry);
}

fn recent_events_snapshot() -> String {
    let Ok(events) = RECENT_EVENTS
        .get_or_init(|| Mutex::new(VecDeque::with_capacity(RECENT_EVENT_LIMIT)))
        .lock()
    else {
        return "recent events unavailable".to_string();
    };

    if events.is_empty() {
        return "no recent events captured".to_string();
    }

    events
        .iter()
        .map(String::as_str)
        .collect::<Vec<_>>()
        .join("\n")
}

pub fn install_panic_hook() {
    let default_hook = panic::take_hook();

    panic::set_hook(Box::new(move |info| {
        let thread = std::thread::current();
        let thread_name = thread.name().unwrap_or("unnamed");
        let location = info
            .location()
            .map(|location| {
                format!(
                    "{}:{}:{}",
                    location.file(),
                    location.line(),
                    location.column()
                )
            })
            .unwrap_or_else(|| "unknown".to_string());
        let backtrace = Backtrace::force_capture();

        append(&format!(
            "\n[{time}][panic] thread={thread_name} location={location}\n{info}\nrecent_events:\n{recent_events}\nbacktrace:\n{backtrace}\n",
            recent_events = recent_events_snapshot(),
            time = timestamp()
        ));

        default_hook(info);
    }));
}
