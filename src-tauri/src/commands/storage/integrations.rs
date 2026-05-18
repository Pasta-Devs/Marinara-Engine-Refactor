use super::shared::ParsedPath;
use super::*;

mod haptic;
mod spotify;
mod tts;

pub(crate) async fn tts_call(
    state: &AppState,
    method: &str,
    rest: &[&str],
    body: Value,
) -> AppResult<Value> {
    tts::tts_call(state, method, rest, body).await
}

pub(crate) async fn spotify_call(
    state: &AppState,
    method: &str,
    rest: &[&str],
    route: &ParsedPath,
    body: Value,
) -> AppResult<Value> {
    spotify::spotify_call(state, method, rest, route, body).await
}

pub(crate) async fn game_spotify_candidates(
    state: &AppState,
    query: &str,
    limit: u32,
    recent_track_uris: &[String],
) -> AppResult<Value> {
    spotify::game_spotify_candidates(state, query, limit, recent_track_uris).await
}

pub(crate) async fn game_spotify_play(
    state: &AppState,
    track: &Value,
    device_id: Option<&str>,
) -> AppResult<Value> {
    spotify::game_spotify_play(state, track, device_id).await
}

pub(crate) async fn haptic_call(rest: &[&str], body: Value) -> AppResult<Value> {
    haptic::haptic_call(rest, body).await
}
